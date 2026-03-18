"use client";

import { useEffect, useState } from "react";
import { updateClass } from "@/actions/classes";

type WAGroup = { jid: string; subject: string; participants: number };

export function WhatsAppGroupSelect({
  classId,
  currentJid,
  groups,
  waConnected,
}: {
  classId: number;
  currentJid: string | null;
  groups: WAGroup[];
  waConnected: boolean | null;
}) {
  const [value, setValue] = useState(currentJid ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(currentJid ?? "");
  }, [currentJid]);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const jid = e.target.value;
    setValue(jid);
    setSaving(true);
    try {
      await updateClass(classId, { whatsappJid: jid || null });
    } finally {
      setSaving(false);
    }
  }

  if (waConnected === null) {
    return <span className="text-sm text-muted-foreground">בודק...</span>;
  }
  if (waConnected === false) {
    return <span className="text-sm text-muted-foreground">WA לא מחובר</span>;
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving}
      className="flex h-8 w-full max-w-[200px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
    >
      <option value="">ללא קבוצה</option>
      {groups.map((g) => (
        <option key={g.jid} value={g.jid}>
          {g.subject}
        </option>
      ))}
    </select>
  );
}
