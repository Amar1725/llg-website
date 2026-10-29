import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
	...handler,
	// Den Header "Server-Timing" entfernen: EmDash zeigt darin interne Messwerte
	// (Datenbank-Abfragen, Ladezeiten), die Besucher nicht sehen müssen.
	async fetch(request, env, ctx) {
		const response = await handler.fetch!(request, env, ctx);
		if (!response.headers.has("server-timing") || response.status === 101) return response;
		const bereinigt = new Response(response.body, response);
		bereinigt.headers.delete("server-timing");
		return bereinigt;
	},
	// Wartungsaufgaben einmal täglich um 02:00 UTC (03:00 Winterzeit, 04:00 Sommerzeit).
	// Spart Rechenzeit im Gratis-Plan von Cloudflare. Muss zu "crons" in wrangler.jsonc passen.
	scheduled: createScheduledHandler({ generalCron: "0 2 * * *" }),
} satisfies ExportedHandler<Env>;
