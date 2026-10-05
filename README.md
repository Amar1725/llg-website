# Ludwig Living Group – Website

Website für Containerhäuser. Gebaut mit [EmDash](https://emdashcms.com) (Astro) auf Cloudflare Workers.

- **Inhalte** (Modelle, Ablauf, Häufige Fragen, Footer, Impressum, Datenschutz, Kontaktformular) werden im Admin unter `/_emdash/admin` gepflegt.
- **Code und Design** liegen hier. Jeder Push auf `main` wird von Cloudflare automatisch gebaut und veröffentlicht.
- **Design-Sicherung:** Das frühere Design „Stein & Moos“ liegt im Zweig `design-stein-moos`.

## Wichtige Dateien

| Datei | Inhalt |
|---|---|
| `src/styles/theme.css` | Farben, Schrift, Buttons, Formular-Stil |
| `src/layouts/Base.astro` | Kopfzeile, Footer |
| `src/pages/index.astro` | Startseite |
| `src/pages/modelle/[slug].astro` | Detailseite eines Modells (alte Adressen `/haeuser/…` leiten dorthin um) |
| `src/pages/kontakt.astro` | Kontaktseite |
| `wrangler.jsonc` | Cloudflare-Konfiguration (Datenbank, Medien) |
