"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type WAStatus = "disconnected" | "connecting" | "connected" | "qr";

const statusLabels: Record<WAStatus, { text: string; color: string }> = {
  disconnected: { text: "מנותק", color: "bg-red-500" },
  connecting: { text: "מתחבר...", color: "bg-yellow-500" },
  qr: { text: "ממתין לסריקה", color: "bg-blue-500" },
  connected: { text: "מחובר", color: "bg-green-500" },
};

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WAStatus>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/whatsapp/sse");

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.status);
      if (data.status !== "qr") setQr(null);
    });

    es.addEventListener("qr", (e) => {
      const data = JSON.parse(e.data);
      setQr(data.qr);
    });

    return () => es.close();
  }, []);

  async function handleConnect() {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/connect", { method: "POST" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
    } finally {
      setLoading(false);
    }
  }

  const badge = statusLabels[status];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">חיבור וואטסאפ</h1>

      <div className="flex items-center gap-3 mb-6">
        <span className={`inline-block w-3 h-3 rounded-full ${badge.color}`} />
        <span className="text-lg font-medium">{badge.text}</span>
      </div>

      {status === "qr" && qr && (
        <div className="mb-6">
          <p className="mb-2 text-sm text-muted-foreground">
            סרקו את הקוד באפליקציית וואטסאפ
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR Code" className="w-64 h-64" />
        </div>
      )}

      <div className="flex gap-3">
        {status === "disconnected" && (
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </Button>
        )}
        {status === "connected" && (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={loading}
          >
            {loading ? "מנתק..." : "נתק"}
          </Button>
        )}
      </div>
    </div>
  );
}
