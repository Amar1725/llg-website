/**
 * Eingangsbestätigung an Personen, die das Kontaktformular absenden.
 *
 * Betreff und Text pflegt der Kunde im Admin unter Widgets →
 * "E-Mail-Bestätigung" (erstes Widget: Titel = Betreff, Text = Inhalt).
 * Das Formular-Plugin verschickt die Bestätigung mit dem Betreff, der in den
 * Formular-Einstellungen hinterlegt ist; daran wird sie hier erkannt.
 */

/** Betreff der Bestätigung in den Formular-Einstellungen (Erkennungsmerkmal) */
export const BESTAETIGUNG_BETREFF = "Ihre Anfrage bei Ludwig Living Group";

interface PtSpan {
	_type?: string;
	text?: string;
}
interface PtBlock {
	_type?: string;
	listItem?: string;
	children?: PtSpan[];
}

/** Portable Text aus dem Widget in einfachen E-Mail-Text umwandeln */
export function ptZuText(bloecke: unknown): string {
	if (!Array.isArray(bloecke)) return "";
	const teile: string[] = [];
	let warListe = false;
	for (const block of bloecke as PtBlock[]) {
		if (block?._type !== "block") continue;
		const text = (block.children ?? []).map((c) => (typeof c?.text === "string" ? c.text : "")).join("");
		const istListe = Boolean(block.listItem);
		const zeile = istListe ? `- ${text}` : text;
		if (teile.length === 0) teile.push(zeile);
		else teile.push(`${istListe && warListe ? "\n" : "\n\n"}${zeile}`);
		warListe = istListe;
	}
	return teile.join("").trim();
}

interface D1Like {
	prepare(sql: string): { first<T>(): Promise<T | null> };
}

/** Betreff und Text aus dem Widget-Bereich lesen; null, wenn leer oder nicht vorhanden */
export async function bestaetigungLaden(db: D1Like): Promise<{ subject: string; text: string } | null> {
	const zeile = await db
		.prepare(
			"SELECT w.title AS title, w.content AS content FROM _emdash_widgets w " +
				"JOIN _emdash_widget_areas a ON a.id = w.area_id " +
				"WHERE a.name = 'email-bestaetigung' ORDER BY w.sort_order LIMIT 1",
		)
		.first<{ title: string | null; content: string | null }>();
	if (!zeile) return null;
	let inhalt: unknown = null;
	try {
		inhalt = zeile.content ? JSON.parse(zeile.content) : null;
	} catch {
		return null;
	}
	const text = ptZuText(inhalt);
	if (!text) return null;
	return { subject: zeile.title?.trim() || BESTAETIGUNG_BETREFF, text };
}
