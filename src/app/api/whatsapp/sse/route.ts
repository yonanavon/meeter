export const dynamic = "force-dynamic";

import { whatsapp } from "@/lib/whatsapp";

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          doCleanup();
        }
      };

      // Send current state immediately
      send("status", { status: whatsapp.getStatus() });
      const qr = whatsapp.getQR();
      if (qr) send("qr", { qr });

      const onStatus = (status: string) => {
        send("status", { status });
      };
      const onQR = (qr: string) => {
        send("qr", { qr });
      };
      const onSticker = () => {
        send("sticker", { count: whatsapp.getPendingStickers().length });
      };

      whatsapp.on("status", onStatus);
      whatsapp.on("qr", onQR);
      whatsapp.on("sticker", onSticker);

      // Keepalive
      const keepalive = setInterval(() => {
        if (closed) { clearInterval(keepalive); return; }
        try { controller.enqueue(encoder.encode(": keepalive\n\n")); } catch { doCleanup(); }
      }, 30_000);

      function doCleanup() {
        if (closed) return;
        closed = true;
        whatsapp.off("status", onStatus);
        whatsapp.off("qr", onQR);
        whatsapp.off("sticker", onSticker);
        clearInterval(keepalive);
      }

      cleanup = doCleanup;
    },
    cancel() {
      cleanup?.();
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
