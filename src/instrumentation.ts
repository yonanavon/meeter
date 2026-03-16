export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Delay startup to ensure DB migrations have completed
    setTimeout(async () => {
      try {
        const { whatsapp } = await import("./lib/whatsapp");
        const { startScheduler } = await import("./lib/scheduler");
        await whatsapp.connect();
        startScheduler();
      } catch (err) {
        console.error("[Instrumentation] WhatsApp startup error:", err);
      }
    }, 5_000);
  }
}
