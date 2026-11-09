/**
 * Animationen beim Scrollen (siehe src/styles/animationen.css).
 *
 * - Zerlegt Überschriften mit data-zeilen in Wörter.
 * - Setzt --i für die Staffelung von Geschwistern (z. B. Modell-Kacheln).
 * - Fügt "sichtbar" hinzu, sobald ein Element ins Bild kommt.
 *
 * Läuft nur, wenn <html> die Klasse "bewegt" hat.
 */

const ZIELE = "[data-reveal], [data-zeilen], [data-linie], [data-vorhang], [data-titelbild], [data-kachel]";

function woerterTrennen(el: HTMLElement) {
	if (el.dataset.getrennt) return;
	el.dataset.getrennt = "1";
	const text = el.textContent?.trim().replace(/\s+/g, " ") ?? "";
	if (!text) return;
	// Wörter sammeln; Wörter in <em> bleiben kursiv
	const teile: { wort: string; tag?: string }[] = [];
	el.childNodes.forEach((n) => {
		const tag = n.nodeType === 1 ? (n as Element).tagName.toLowerCase() : undefined;
		(n.textContent ?? "").split(/\s+/).filter(Boolean).forEach((wort) => teile.push({ wort, tag }));
	});
	// Für Screenreader den ganzen Satz behalten
	el.setAttribute("aria-label", text);
	el.textContent = "";
	teile.forEach(({ wort, tag }, i, alle) => {
		const huelle = document.createElement("span");
		huelle.className = "wort";
		huelle.setAttribute("aria-hidden", "true");
		const innen = document.createElement(tag === "em" ? "em" : "span");
		innen.textContent = wort;
		innen.style.setProperty("--w", String(i));
		huelle.append(innen);
		el.append(huelle);
		if (i < alle.length - 1) el.append(" ");
	});
}

function staffeln() {
	// Elemente mit data-staffel geben ihren direkten Kindern eine fortlaufende
	// Nummer; tiefer liegende Elemente erben sie über die CSS-Variable.
	document.querySelectorAll<HTMLElement>("[data-staffel]").forEach((eltern) => {
		Array.from(eltern.children).forEach((kind, i) => {
			(kind as HTMLElement).style.setProperty("--i", String(i));
		});
	});
}

export function animationenStarten() {
	const root = document.documentElement;
	if (!root.classList.contains("bewegt")) return;

	document.querySelectorAll<HTMLElement>("[data-zeilen]").forEach(woerterTrennen);
	staffeln();

	const ziele = document.querySelectorAll<HTMLElement>(ZIELE);
	if (!("IntersectionObserver" in window)) {
		ziele.forEach((el) => el.classList.add("sichtbar"));
		root.classList.add("anim-bereit");
		return;
	}

	// Ein Bild mit Vorhang ist anfangs komplett weggeschnitten (clip-path) und
	// gilt für den Browser deshalb als unsichtbar. Darum wird bei ihm das
	// umgebende Element beobachtet. Im Modell-Karussell zählt das ganze
	// Karussell, damit auch die seitlich angeschnittenen Modelle erscheinen.
	const fuer = new Map<Element, HTMLElement[]>();
	ziele.forEach((el) => {
		const karussell = el.closest("[data-karussell]");
		const beobachtet =
			karussell ?? (el.hasAttribute("data-vorhang") && el.parentElement ? el.parentElement : el);
		fuer.set(beobachtet, [...(fuer.get(beobachtet) ?? []), el]);
	});

	const beobachter = new IntersectionObserver(
		(eintraege) => {
			for (const e of eintraege) {
				if (!e.isIntersecting) continue;
				fuer.get(e.target)?.forEach((el) => el.classList.add("sichtbar"));
				beobachter.unobserve(e.target);
			}
		},
		{ rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
	);

	fuer.forEach((_, el) => beobachter.observe(el));
	root.classList.add("anim-bereit");
}

/**
 * Kontaktformular: Erscheint die Erfolgsmeldung des Formular-Plugins, wird
 * davor ein Häkchen eingesetzt, das sich zeichnet (CSS in animationen.css).
 * Läuft immer, auch ohne Animationen (dann steht das Häkchen einfach da).
 */
export function formularErfolgStarten() {
	const SVG =
		'<svg class="erfolg-haken" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" /><polyline points="13,23 19.5,29 31,16" /></svg>';
	// Das Plugin schreibt beim Senden "Submitting..." und danach "Submit" auf den
	// Knopf (englisch, und der eigene Text geht verloren). Hier auf Deutsch halten.
	document.querySelectorAll<HTMLButtonElement>(".ec-form-submit").forEach((knopf) => {
		const original = knopf.textContent?.trim() || "Senden";
		new MutationObserver(() => {
			const jetzt = knopf.textContent?.trim();
			if (jetzt === "Submitting...") knopf.textContent = "Wird gesendet …";
			else if (jetzt === "Submit") knopf.textContent = original;
		}).observe(knopf, { childList: true, characterData: true, subtree: true });
	});

	document.querySelectorAll<HTMLElement>("[data-form-status]").forEach((status) => {
		new MutationObserver(() => {
			if (!status.classList.contains("ec-form-status--success")) return;
			if (status.querySelector(".erfolg-haken")) return;
			const text = document.createElement("span");
			text.textContent = status.textContent ?? "";
			status.textContent = "";
			status.insertAdjacentHTML("afterbegin", SVG);
			status.append(text);
		}).observe(status, { attributes: true, attributeFilter: ["class"], childList: true });
	});
}
