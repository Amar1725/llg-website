import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { cloudflareEmail } from "@emdash-cms/cloudflare/plugins/cloudflare-email";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		ssr: {
			optimizeDeps: {
				// Pre-bundle so it isn't discovered mid-render, which would trigger
				// a Vite dep re-optimization and break in-flight worker imports
				// under the Cloudflare dev runner (workerd).
				include: ["astro-iconset/components"],
			},
		},
	},
	integrations: [
		react(),
		icon({
			// Only ship the Phosphor icons actually referenced in templates,
			// not the full @iconify-json/ph set (which adds megabytes to the
			// deployed worker bundle).
			include: {
				ph: [
					"chart-bar",
					"check-circle",
					"clock",
					"cloud",
					"code",
					"currency-dollar",
					"envelope",
					"globe",
					"heart",
					"lifebuoy",
					"lightning",
					"lock",
					"shield-check",
					"sparkle",
					"star",
					"users-three",
				],
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			// Kontaktformular: Formulare im Admin bauen, Anfragen landen unter "Submissions"
			// E-Mail-Versand über Cloudflare (Benachrichtigung bei neuen Anfragen)
			plugins: [
				formsPlugin({ defaultSpamProtection: "honeypot" }),
				cloudflareEmail({
					from: { email: "website@ludwiglivinggroup.de", name: "Website Ludwig Living Group" },
				}),
			],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Jost",
			cssVariable: "--font-body",
			weights: [300, 400, 500],
			fallbacks: ["sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
