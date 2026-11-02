/**
 * Kopfzeile und Vollbild-Menü (siehe src/styles/menue.css).
 *
 * - Kopfzeile über dem Titelbild wird beim Scrollen hell ("gescrollt").
 * - Menü-Knopf öffnet/schliesst das Menü; Esc und ein Klick auf einen
 *   Eintrag schliessen es wieder.
 */
export function kopfzeileStarten() {
	const root = document.documentElement;
	const kopf = document.querySelector<HTMLElement>("[data-kopfzeile]");
	const knopf = document.querySelector<HTMLButtonElement>("[data-menue-knopf]");
	const menue = document.querySelector<HTMLElement>("[data-menue]");
	if (!kopf) return;

	// Hell werden, sobald der Titel aus dem Bild gescrollt ist
	if (kopf.classList.contains("ueber-bild")) {
		const pruefen = () => kopf.classList.toggle("gescrollt", window.scrollY > 40);
		window.addEventListener("scroll", pruefen, { passive: true });
		pruefen();
	}

	if (!knopf || !menue) return;
	const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let offen = false;
	let zuTimer = 0;

	// Kreis öffnet sich genau aus der Mitte des Knopfs
	const mitteSetzen = () => {
		const r = knopf.getBoundingClientRect();
		menue.style.setProperty("--mx", `${r.left + r.width / 2}px`);
		menue.style.setProperty("--my", `${r.top + r.height / 2}px`);
	};

	const oeffnen = () => {
		clearTimeout(zuTimer);
		offen = true;
		mitteSetzen();
		menue.hidden = false;
		// Ein Frame warten, damit der Startzustand (Kreis = 0) gezeichnet ist
		requestAnimationFrame(() => requestAnimationFrame(() => menue.classList.add("offen")));
		root.classList.add("menue-offen");
		knopf.setAttribute("aria-expanded", "true");
		knopf.setAttribute("aria-label", "Menü schliessen");
		setTimeout(() => menue.querySelector<HTMLElement>("[data-menue-link]")?.focus({ preventScroll: true }), 350);
	};

	const schliessen = (fokusZurueck = true) => {
		if (!offen) return;
		offen = false;
		menue.classList.remove("offen");
		root.classList.remove("menue-offen");
		knopf.setAttribute("aria-expanded", "false");
		knopf.setAttribute("aria-label", "Menü öffnen");
		zuTimer = window.setTimeout(() => (menue.hidden = true), reduziert ? 0 : 900);
		if (fokusZurueck) knopf.focus({ preventScroll: true });
	};

	knopf.addEventListener("click", () => (offen ? schliessen() : oeffnen()));
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") schliessen();
	});
	menue.querySelectorAll<HTMLAnchorElement>("[data-menue-link]").forEach((link) => {
		link.addEventListener("click", () => schliessen(false));
	});
	// Klick ins Leere schliesst ebenfalls
	menue.addEventListener("click", (e) => {
		if (e.target === menue) schliessen();
	});
}
