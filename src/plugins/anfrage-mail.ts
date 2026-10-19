/**
 * Benachrichtigungs-Mail für neue Kontaktanfragen auf Deutsch umformatieren.
 *
 * Das Formular-Plugin liefert einen englischen Text ("New submission for ...",
 * "Label: Wert"-Zeilen, "Submitted at: ..."). Diese Funktion liest ihn aus und
 * baut daraus Betreff, Text und Antwort-Adresse nach unserer Vorlage.
 * Passt der Text nicht zum erwarteten Aufbau, wird null zurückgegeben und die
 * Mail unverändert verschickt.
 */

const ADMIN_URL = "https://ludwiglivinggroup.de/_emdash/admin";
const KOPF = "Neue Anfrage über die Website ludwiglivinggroup.de";
const LINIE = "────────────────────────";

/** Anzeigenamen für Feldbeschriftungen aus dem Formular */
const ANZEIGE: Record<string, string> = { "Modell (optional)": "Modell" };

export interface AnfrageMail {
	subject: string;
	text: string;
	replyTo?: string;
}

export function anfrageMail(subject: string, text: string, jetzt = new Date()): AnfrageMail | null {
	if (!subject.startsWith("New submission:")) return null;

	const ende = text.lastIndexOf("\n\nSubmitted at:");
	const start = text.indexOf("\n\n");
	if (start < 0 || ende <= start) return null;

	// "Label: Wert"-Zeilen einlesen; Folgezeilen gehören zum vorherigen Feld
	// (mehrzeilige Nachricht). Die Nachricht ist das letzte Feld.
	const felder: Array<{ label: string; wert: string }> = [];
	for (const zeile of text.slice(start + 2, ende).split("\n")) {
		const aktuell = felder[felder.length - 1];
		const treffer = /^([^:]{1,40}): (.*)$/.exec(zeile);
		if (treffer && aktuell?.label !== "Nachricht") {
			felder.push({ label: treffer[1], wert: treffer[2] });
		} else if (aktuell) {
			aktuell.wert += `\n${zeile}`;
		} else {
			return null;
		}
	}

	const wert = (label: string) => felder.find((f) => f.label === label)?.wert.trim();
	const name = wert("Name");
	const email = wert("E-Mail");
	const nachricht = wert("Nachricht");

	const liste = felder
		.filter((f) => f.label !== "Nachricht")
		.map((f) => `${`${ANZEIGE[f.label] ?? f.label}:`.padEnd(11)}${f.wert.trim()}`);

	const zeit = new Intl.DateTimeFormat("de-DE", {
		timeZone: "Europe/Berlin",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).formatToParts(jetzt);
	const teil = (typ: string) => zeit.find((p) => p.type === typ)?.value ?? "";
	const eingang = `${teil("day")}.${teil("month")}.${teil("year")} um ${teil("hour")}:${teil("minute")} Uhr`;

	const zeilen = [KOPF, "", ...liste];
	if (nachricht) zeilen.push("", "Nachricht:", nachricht);
	zeilen.push(
		"",
		LINIE,
		`Eingegangen am ${eingang}`,
		"Alle Anfragen finden Sie auch im Admin unter",
		ADMIN_URL,
	);

	return {
		subject: name ? `Neue Anfrage von ${name}` : "Neue Anfrage über die Website",
		text: zeilen.join("\n"),
		...(email && email.includes("@") ? { replyTo: email } : {}),
	};
}
