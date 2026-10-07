import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
	...handler,
	// Wartungsaufgaben (Backups, Plugin-Aufgaben) nur stündlich statt jede Minute.
	// Spart Rechenzeit im Gratis-Plan von Cloudflare. Muss zu "crons" in wrangler.jsonc passen.
	scheduled: createScheduledHandler({ generalCron: "0 * * * *" }),
} satisfies ExportedHandler;
