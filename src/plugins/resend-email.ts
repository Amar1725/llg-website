/**
 * E-Mail-Versand über Resend (https://resend.com).
 *
 * Kleines eigenes Plugin statt des Drittanbieter-Pakets: Es stellt EmDash
 * einen Versanddienst bereit ("email:deliver"). Das Kontaktformular nutzt
 * ihn, um bei neuen Anfragen eine Benachrichtigung zu schicken.
 *
 * Der API-Schlüssel liegt NICHT im Code, sondern als geheime Variable
 * RESEND_API_KEY beim Worker (Cloudflare → Worker → Einstellungen →
 * Variablen und Geheimnisse).
 */
import { definePlugin } from "emdash";
import type { PluginDescriptor, ResolvedPlugin } from "emdash";

export interface ResendEmailConfig {
	/** Absender, z. B. "Ludwig Living Group <website@ludwiglivinggroup.de>" */
	from: string;
}

async function apiKey(): Promise<string> {
	const { env } = await import("cloudflare:workers");
	const key = (env as Record<string, unknown>).RESEND_API_KEY;
	if (typeof key !== "string" || !key) {
		throw new Error("[resend-email] Geheime Variable RESEND_API_KEY fehlt beim Worker.");
	}
	return key;
}

export function createPlugin(config: ResendEmailConfig): ResolvedPlugin {
	return definePlugin({
		id: "resend-email",
		version: "1.0.0",
		capabilities: ["hooks.email-transport:register"],
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async (event, ctx) => {
					const { message } = event;
					const response = await fetch("https://api.resend.com/emails", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${await apiKey()}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							from: config.from,
							to: message.to,
							subject: message.subject,
							text: message.text,
							...(message.html ? { html: message.html } : {}),
							...(message.replyTo ? { reply_to: message.replyTo } : {}),
						}),
					});
					if (!response.ok) {
						throw new Error(`[resend-email] Resend antwortete ${response.status}: ${await response.text()}`);
					}
					ctx.log.info("E-Mail über Resend verschickt", { to: message.to, subject: message.subject });
				},
			},
		},
	});
}

/** Für astro.config.mjs: plugins: [resendEmail({ from: "..." })] */
export function resendEmail(config: ResendEmailConfig): PluginDescriptor<ResendEmailConfig> {
	return {
		id: "resend-email",
		version: "1.0.0",
		entrypoint: new URL("./resend-email.ts", import.meta.url).pathname,
		format: "native",
		options: config,
		capabilities: ["hooks.email-transport:register"],
	};
}
