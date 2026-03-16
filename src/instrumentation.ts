export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { whatsapp } = await import("./lib/whatsapp");
    const { startScheduler } = await import("./lib/scheduler");
    whatsapp.connect().catch(console.error);
    startScheduler();
  }
}
