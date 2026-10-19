import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
	...handler,
	// Wartungsaufgaben einmal täglich um 02:00 UTC (03:00 Winterzeit, 04:00 Sommerzeit).
	// Spart Rechenzeit im Gratis-Plan von Cloudflare. Muss zu "crons" in wrangler.jsonc passen.
	scheduled: createScheduledHandler({ generalCron: "0 2 * * *" }),
} satisfies ExportedHandler;
