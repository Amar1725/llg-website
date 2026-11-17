// Baustellen-Seite ("Website im Aufbau").
// Ein- und ausschalten über "WARTUNG" in wrangler.jsonc ("an" / "aus"), danach pushen.
// Erreichbar bleiben: Admin (/_emdash), Impressum, Datenschutz und alle Dateien,
// die diese Seiten brauchen. Mit ?vorschau=1 sieht man die echte Website trotzdem
// (merkt sich das per Cookie, ?vorschau=0 schaltet es wieder ab).

const FREI = [/^\/_emdash(\/|$)/, /^\/_astro\//, /^\/_image/, /^\/_server-islands\//, /^\/impressum\/?$/, /^\/datenschutz\/?$/, /^\/[^/]+\.(ico|png|svg|webp|jpg|webmanifest|txt|xml)$/];

export function wartungAntwort(request: Request): Response | null {
	const url = new URL(request.url);
	if (FREI.some((r) => r.test(url.pathname))) return null;

	const cookie = request.headers.get("cookie") ?? "";
	const vorschau = url.searchParams.get("vorschau");
	if (vorschau === "1") {
		url.searchParams.delete("vorschau");
		return new Response(null, {
			status: 302,
			headers: { location: url.pathname + url.search, "set-cookie": "llg_vorschau=1; Path=/; Max-Age=2592000; Secure; HttpOnly; SameSite=Lax" },
		});
	}
	if (vorschau === "0") {
		return new Response(null, { status: 302, headers: { location: "/", "set-cookie": "llg_vorschau=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax" } });
	}
	if (/(?:^|;\s*)llg_vorschau=1/.test(cookie)) return null;

	return new Response(SEITE, {
		status: 503,
		headers: {
			"content-type": "text/html; charset=utf-8",
			"retry-after": "86400",
			"cache-control": "no-store",
		},
	});
}

const SEITE = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ludwig Living Group – Website im Aufbau</title>
<meta name="description" content="Die Website der Ludwig Living Group wird gerade überarbeitet. Modulhäuser – sprechen Sie uns gerne direkt an.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;min-height:100vh;background:#fff;color:#1c1d1e;font-family:"Jost",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px 24px}
.logo{display:flex;flex-direction:column;align-items:center;gap:18px;margin-bottom:56px}
.logo svg{width:64px;height:64px;fill:none;stroke:#b8975a;stroke-width:3.4;stroke-linecap:square}
.logo span{font-weight:500;font-size:13px;letter-spacing:.34em;padding-left:.34em}
.kicker{display:flex;align-items:center;gap:14px;margin:0 0 18px;color:#8a6d3b;font-size:12px;font-weight:500;letter-spacing:.24em;text-transform:uppercase}
.kicker::before,.kicker::after{content:"";width:32px;height:1px;background:#b8975a}
h1{margin:0 0 20px;font-family:"Instrument Serif",Georgia,"Times New Roman",serif;font-weight:400;font-size:clamp(2.2rem,6vw,3.6rem);line-height:1.05;letter-spacing:-.01em}
h1 em{color:#b8975a}
p.text{max-width:34rem;margin:0 auto 40px;color:#4a4b4c;font-size:1.05rem;line-height:1.65}
.kontakt{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.kontakt a{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border:1px solid #1c1d1e;color:#1c1d1e;text-decoration:none;font-size:.95rem}
.kontakt a.voll{background:#1c1d1e;color:#fff}
.kontakt a:hover{border-color:#b8975a}
footer{padding:24px;text-align:center;font-size:.85rem;color:#5f6061}
footer a{color:#5f6061;margin:0 10px}
</style>
</head>
<body>
<main>
<div class="logo" aria-label="Ludwig Living Group">
<svg viewBox="0 0 64 64" aria-hidden="true"><polyline points="13,30 32,14 51,30"/><polyline points="21,32 21,52 41,52"/><polyline points="29,34 29,44 37,44"/></svg>
<span>LUDWIG LIVING GROUP</span>
</div>
<p class="kicker">Website im Aufbau</p>
<h1>Hier entsteht <em>Neues</em></h1>
<p class="text">Unsere Website wird gerade überarbeitet und ist in Kürze wieder für Sie da. Sie interessieren sich für ein Modulhaus? Sprechen Sie uns gerne direkt an.</p>
<div class="kontakt">
<a class="voll" href="mailto:contact@ludwiglivinggroup.de">contact@ludwiglivinggroup.de</a>
<a href="tel:+4917670203891">+49 176 70203891</a>
</div>
</main>
<footer><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></footer>
</body>
</html>`;
