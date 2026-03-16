import { EventEmitter } from "events";
import QRCode from "qrcode";
import { usePrismaAuthState } from "./whatsapp-auth-store";
import { prisma } from "./prisma";

export interface PendingSticker {
  base64: string;
  mimetype: string;
  from: string;
  timestamp: string;
}

type WAStatus = "disconnected" | "connecting" | "connected" | "qr";

class WhatsAppService extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private socket: any = null;
  private status: WAStatus = "disconnected";
  private currentQR: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pendingStickers: PendingSticker[] = [];
  private maxPendingStickers = 20;

  async connect() {
    try {
      this.status = "connecting";
      this._emitStatus();

      const baileys = await import("baileys");
      const makeWASocket = baileys.default;
      const {
        DisconnectReason,
        fetchLatestBaileysVersion,
        makeCacheableSignalKeyStore,
      } = baileys;

      const { state, saveCreds } = await usePrismaAuthState();
      const { version } = await fetchLatestBaileysVersion();

      this.socket = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          keys: makeCacheableSignalKeyStore(state.keys as any, undefined),
        },
        browser: baileys.Browsers.ubuntu("Chrome"),
        printQRInTerminal: true,
        generateHighQualityLinkPreview: false,
      });

      this.socket.ev.on(
        "connection.update",
        async (update: {
          connection?: string;
          lastDisconnect?: { error?: { output?: { statusCode?: number }; message?: string } };
          qr?: string;
        }) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            this.currentQR = await QRCode.toDataURL(qr);
            this.status = "qr";
            this._emitStatus();
            this.emit("qr", this.currentQR);
          }

          if (connection === "close") {
            this.currentQR = null;
            const statusCode =
              lastDisconnect?.error?.output?.statusCode;
            const errorMsg =
              lastDisconnect?.error?.message || "unknown";
            console.log(
              `[WA] Connection closed — statusCode=${statusCode}, error="${errorMsg}"`
            );

            if (statusCode === DisconnectReason.loggedOut) {
              console.log("[WA] Logged out, clearing session...");
              await prisma.whatsappSession.deleteMany();
              this.status = "disconnected";
              this._emitStatus();
            } else if (
              statusCode === 408 ||
              errorMsg === "QR refs attempts ended"
            ) {
              console.log("[WA] QR expired, waiting for manual reconnect");
              this.status = "disconnected";
              this._emitStatus();
            } else if (
              this.reconnectAttempts < this.maxReconnectAttempts
            ) {
              this.reconnectAttempts++;
              const delay = 3000 * this.reconnectAttempts;
              console.log(
                `[WA] Reconnecting... attempt ${this.reconnectAttempts} in ${delay}ms`
              );
              this.status = "connecting";
              this._emitStatus();
              setTimeout(() => this.connect(), delay);
            } else {
              this.status = "disconnected";
              this._emitStatus();
              console.log("[WA] Max reconnect attempts reached");
            }
          }

          if (connection === "open") {
            this.status = "connected";
            this.currentQR = null;
            this.reconnectAttempts = 0;
            this._emitStatus();
            console.log("[WA] Connected successfully");
          }
        }
      );

      this.socket.ev.on("creds.update", saveCreds);

      this.socket.ev.on(
        "messages.upsert",
        async ({
          messages,
          type,
        }: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: any[];
          type: string;
        }) => {
          if (type !== "notify") return;

          for (const msg of messages) {
            if (msg.key.fromMe) continue;
            if (!msg.message) continue;

            const stickerMsg = msg.message.stickerMessage;
            if (stickerMsg) {
              try {
                const { downloadMediaMessage } = await import("baileys");
                const buffer = await downloadMediaMessage(
                  msg,
                  "buffer",
                  {}
                );
                const base64 = Buffer.from(buffer as Buffer).toString(
                  "base64"
                );

                const sticker: PendingSticker = {
                  base64,
                  mimetype: stickerMsg.mimetype || "image/webp",
                  from: msg.key.remoteJid,
                  timestamp: new Date().toISOString(),
                };

                this.pendingStickers.unshift(sticker);
                if (
                  this.pendingStickers.length > this.maxPendingStickers
                ) {
                  this.pendingStickers.pop();
                }

                console.log(
                  `[WA] Sticker received from ${msg.key.remoteJid}`
                );
                this.emit("sticker", sticker);
              } catch (err) {
                console.error("[WA] Error downloading sticker:", err);
              }
            }
          }
        }
      );
    } catch (error) {
      console.error("[WA] Connection error:", error);
      this.status = "disconnected";
      this._emitStatus();
    }
  }

  async sendSticker(jid: string, buffer: Buffer) {
    if (!this.socket || this.status !== "connected") {
      throw new Error("WhatsApp not connected");
    }
    await this.socket.sendMessage(jid, { sticker: buffer });
    console.log(`[WA] Sticker sent to ${jid}`);
  }

  async getGroups() {
    if (!this.socket || this.status !== "connected") {
      throw new Error("WhatsApp not connected");
    }
    const groups = await this.socket.groupFetchAllParticipating();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.values(groups).map(
      (g: any) => ({
        jid: g.id,
        subject: g.subject,
        participants: g.participants?.length || 0,
      })
    );
  }

  async logout() {
    if (this.socket) {
      try {
        await this.socket.logout();
      } catch {
        // ignore — socket may already be closed
      }
      this.socket.end(undefined);
      this.socket = null;
    }
    await prisma.whatsappSession.deleteMany();
    console.log("[WA] Session cleared from DB");
    this.reconnectAttempts = 0;
    this.status = "disconnected";
    this.currentQR = null;
    this._emitStatus();
  }

  async restart() {
    if (this.socket) {
      this.socket.end(undefined);
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.status = "disconnected";
    this.currentQR = null;
    this._emitStatus();
    this.connect().catch((err) =>
      console.error("[WA] Restart connect error:", err)
    );
  }

  getStatus(): WAStatus {
    return this.status;
  }

  getQR(): string | null {
    return this.currentQR;
  }

  getPendingStickers(): PendingSticker[] {
    return [...this.pendingStickers];
  }

  clearPendingSticker(index: number) {
    if (index >= 0 && index < this.pendingStickers.length) {
      this.pendingStickers.splice(index, 1);
    }
  }

  private _emitStatus() {
    this.emit("status", this.status);
  }
}

const globalForWA = globalThis as unknown as {
  whatsapp: WhatsAppService | undefined;
};
export const whatsapp =
  globalForWA.whatsapp ?? new WhatsAppService();
if (process.env.NODE_ENV !== "production") globalForWA.whatsapp = whatsapp;
