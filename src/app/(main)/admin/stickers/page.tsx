"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPendingStickers,
  savePendingSticker,
  dismissPendingSticker,
  getAllStickers,
  toggleStickerApproval,
  deleteSticker,
  getApprovedStickers,
} from "@/actions/stickers";
import {
  getReminderRules,
  createReminderRule,
  updateReminderRule,
  deleteReminderRule,
} from "@/actions/reminders";
type PendingSticker = {
  base64: string;
  mimetype: string;
  from: string;
  timestamp: string;
};

type DBSticker = {
  id: number;
  base64: string;
  mimetype: string;
  approved: boolean;
  label: string;
  createdAt: Date;
};

type ReminderRuleWithSticker = {
  id: number;
  minutesBefore: number;
  label: string;
  stickerId: number;
  enabled: boolean;
  sticker: DBSticker;
};

export default function StickersPage() {
  const [pending, setPending] = useState<PendingSticker[]>([]);
  const [stickers, setStickers] = useState<DBSticker[]>([]);
  const [rules, setRules] = useState<ReminderRuleWithSticker[]>([]);
  const [approvedStickers, setApprovedStickers] = useState<DBSticker[]>([]);

  // New rule form
  const [newMinutes, setNewMinutes] = useState("15");
  const [newLabel, setNewLabel] = useState("");
  const [newStickerId, setNewStickerId] = useState("");

  const refresh = useCallback(async () => {
    const [p, s, r, a] = await Promise.all([
      getPendingStickers(),
      getAllStickers(),
      getReminderRules(),
      getApprovedStickers(),
    ]);
    setPending(p);
    setStickers(s as DBSticker[]);
    setRules(r as ReminderRuleWithSticker[]);
    setApprovedStickers(a as DBSticker[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for new stickers via SSE
  useEffect(() => {
    const es = new EventSource("/api/whatsapp/sse");
    es.addEventListener("sticker", () => {
      getPendingStickers().then(setPending);
    });
    return () => es.close();
  }, []);

  async function handleSave(index: number) {
    await savePendingSticker(index);
    await refresh();
  }

  async function handleDismiss(index: number) {
    await dismissPendingSticker(index);
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleToggleApproval(id: number) {
    await toggleStickerApproval(id);
    await refresh();
  }

  async function handleDeleteSticker(id: number) {
    await deleteSticker(id);
    await refresh();
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newStickerId) return;
    await createReminderRule({
      minutesBefore: Number(newMinutes),
      label: newLabel,
      stickerId: Number(newStickerId),
    });
    setNewMinutes("15");
    setNewLabel("");
    setNewStickerId("");
    await refresh();
  }

  async function handleToggleRule(id: number, enabled: boolean) {
    await updateReminderRule(id, { enabled: !enabled });
    await refresh();
  }

  async function handleDeleteRule(id: number) {
    await deleteReminderRule(id);
    await refresh();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">ניהול סטיקרים ותזכורות</h1>

      {/* Pending Stickers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">מדבקות שהתקבלו</h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            שלחו מדבקה לצ&apos;אט עם המספר המחובר כדי שתופיע כאן
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {pending.map((s, i) => (
              <div key={i} className="border rounded-lg p-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${s.mimetype};base64,${s.base64}`}
                  alt="sticker"
                  className="w-20 h-20 mx-auto object-contain"
                />
                <div className="flex gap-1 mt-2 justify-center">
                  <Button size="sm" onClick={() => handleSave(i)}>
                    שמור
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(i)}
                  >
                    מחק
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Stickers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">מדבקות שמורות</h2>
        {stickers.length === 0 ? (
          <p className="text-muted-foreground text-sm">אין מדבקות שמורות</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {stickers.map((s) => (
              <div
                key={s.id}
                className={`border rounded-lg p-2 text-center ${
                  s.approved ? "border-green-500" : "border-gray-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${s.mimetype};base64,${s.base64}`}
                  alt="sticker"
                  className="w-20 h-20 mx-auto object-contain"
                />
                <p className="text-xs mt-1 truncate">{s.label || `#${s.id}`}</p>
                <div className="flex gap-1 mt-1 justify-center">
                  <Button
                    size="sm"
                    variant={s.approved ? "default" : "outline"}
                    onClick={() => handleToggleApproval(s.id)}
                  >
                    {s.approved ? "מאושר" : "אשר"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSticker(s.id)}
                  >
                    מחק
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reminder Rules */}
      <section>
        <h2 className="text-xl font-semibold mb-3">כללי תזכורת</h2>

        {rules.length > 0 && (
          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-right">תיאור</th>
                  <th className="p-2 text-right">דקות לפני</th>
                  <th className="p-2 text-right">מדבקה</th>
                  <th className="p-2 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.label}</td>
                    <td className="p-2">{r.minutesBefore}</td>
                    <td className="p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${r.sticker.mimetype};base64,${r.sticker.base64}`}
                        alt="sticker"
                        className="w-8 h-8 object-contain"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={r.enabled ? "default" : "outline"}
                          onClick={() => handleToggleRule(r.id, r.enabled)}
                        >
                          {r.enabled ? "פעיל" : "מושבת"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRule(r.id)}
                        >
                          מחק
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form
          onSubmit={handleAddRule}
          className="flex flex-wrap items-end gap-3 border rounded-lg p-4"
        >
          <div>
            <Label htmlFor="minutes">דקות לפני</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="w-24"
              required
            />
          </div>
          <div>
            <Label htmlFor="ruleLabel">תיאור</Label>
            <Input
              id="ruleLabel"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder='למשל: "15 דקות לפני"'
              className="w-48"
              required
            />
          </div>
          <div>
            <Label htmlFor="sticker">מדבקה</Label>
            <select
              id="sticker"
              value={newStickerId}
              onChange={(e) => setNewStickerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              required
            >
              <option value="">בחר מדבקה</option>
              {approvedStickers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || `מדבקה #${s.id}`}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">הוסף כלל</Button>
        </form>
      </section>
    </div>
  );
}
