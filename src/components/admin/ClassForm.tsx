"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass, updateClass } from "@/actions/classes";
import type { Class } from "@/types";

type WAGroup = { jid: string; subject: string; participants: number };

export function ClassForm({
  classData,
  trigger,
}: {
  classData?: Class;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(classData?.name ?? "");
  const [number, setNumber] = useState(classData?.number?.toString() ?? "");
  const [whatsappJid, setWhatsappJid] = useState(classData?.whatsappJid ?? "");
  const [groups, setGroups] = useState<WAGroup[]>([]);
  const [waConnected, setWaConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/whatsapp/status")
      .then((r) => r.json())
      .then((data) => {
        setWaConnected(data.status === "connected");
        if (data.status === "connected") {
          fetch("/api/whatsapp/groups")
            .then((r) => r.json())
            .then((g) => {
              if (Array.isArray(g)) setGroups(g);
            });
        }
      })
      .catch(() => setWaConnected(false));
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (classData) {
      await updateClass(classData.id, {
        name,
        number: Number(number),
        whatsappJid: whatsappJid || null,
      });
    } else {
      await createClass({ name, number: Number(number) });
    }
    setOpen(false);
    if (!classData) {
      setName("");
      setNumber("");
      setWhatsappJid("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {classData ? "עריכת כיתה" : "הוספת כיתה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">שם</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="number">מספר</Label>
            <Input
              id="number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>
          {classData && (
            <div>
              <Label htmlFor="whatsappGroup">קבוצת וואטסאפ</Label>
              {waConnected === false ? (
                <p className="text-sm text-muted-foreground">
                  וואטסאפ לא מחובר
                </p>
              ) : waConnected === null ? (
                <p className="text-sm text-muted-foreground">בודק חיבור...</p>
              ) : (
                <select
                  id="whatsappGroup"
                  value={whatsappJid}
                  onChange={(e) => setWhatsappJid(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">ללא קבוצה</option>
                  {groups.map((g) => (
                    <option key={g.jid} value={g.jid}>
                      {g.subject}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <Button type="submit">{classData ? "עדכון" : "הוספה"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
