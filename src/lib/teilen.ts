/**
 * Hilfen für Vorschauen beim Teilen (WhatsApp, Facebook, LinkedIn, E-Mail).
 */

/** Absolute URL eines EmDash-Bildfelds, z. B. für og:image. */
export function bildUrl(bild: any, origin: string): string | null {
	if (!bild) return null;
	const pfad =
		bild.src ??
		bild.url ??
		(bild.meta?.storageKey ? `/_emdash/api/media/file/${bild.meta.storageKey}` : null);
	if (!pfad) return null;
	return new URL(pfad, origin).toString();
}

/** Klartext aus Portable Text, gekürzt auf etwa `max` Zeichen. */
export function kurzText(portableText: any, max = 160): string {
	if (!Array.isArray(portableText)) return "";
	const text = portableText
		.filter((b: any) => b?._type === "block" && b.style !== "h2" && b.style !== "h3")
		.map((b: any) => (b.children ?? []).map((c: any) => c.text ?? "").join(""))
		.join(" ")
		.replace(/\s+/g, " ")
		.trim();
	if (text.length <= max) return text;
	const schnitt = text.slice(0, max);
	return schnitt.slice(0, schnitt.lastIndexOf(" ")) + " …";
}
