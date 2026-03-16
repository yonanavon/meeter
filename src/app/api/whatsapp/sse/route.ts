export const dynamic = "force-dynamic";

import { whatsapp } from "@/lib/whatsapp";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send current state immediately
      send("status", { status: whatsapp.getStatus() });
      const qr = whatsapp.getQR();
      if (qr) send("qr", { qr });

      const onStatus = (status: string) => {
        try { send("status", { status }); } catch { /* client disconnected */ }
      };
      const onQR = (qr: string) => {
        try { send("qr", { qr }); } catch { /* client disconnected */ }
      };
      const onSticker = () => {
        try { send("sticker", { count: whatsapp.getPendingStickers().length }); } catch { /* client disconnected */ }
      };

      whatsapp.on("status", onStatus);
      whatsapp.on("qr", onQR);
      whatsapp.on("sticker", onSticker);

      // Keepalive
      const keepalive = setInterval(() => {
        try { controller.enqueue(encoder.encode(": keepalive\n\n")); } catch { clearInterval(keepalive); }
      }, 30_000);

      // Cleanup on cancel — use a polling approach since ReadableStream cancel isn't always called
      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(""));
        } catch {
          cleanup();
        }
      }, 60_000);

      function cleanup() {
        whatsapp.off("status", onStatus);
        whatsapp.off("qr", onQR);
        whatsapp.off("sticker", onSticker);
        clearInterval(keepalive);
        clearInterval(checkClosed);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
