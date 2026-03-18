"use client";

import { useEffect, useState } from "react";
import { deleteClass } from "@/actions/classes";
import { ClassForm } from "@/components/admin/ClassForm";
import { WhatsAppGroupSelect } from "@/components/admin/WhatsAppGroupSelect";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Class } from "@/types";

type WAGroup = { jid: string; subject: string; participants: number };

export function ClassesTable({ classes }: { classes: Class[] }) {
  const [waConnected, setWaConnected] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<WAGroup[]>([]);

  useEffect(() => {
    fetch("/api/whatsapp/status")
      .then((r) => r.json())
      .then((data) => {
        const connected = data.status === "connected";
        setWaConnected(connected);
        if (connected) {
          fetch("/api/whatsapp/groups")
            .then((r) => r.json())
            .then((g) => {
              if (Array.isArray(g)) setGroups(g);
            });
        }
      })
      .catch(() => setWaConnected(false));
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>מספר</TableHead>
          <TableHead>שם</TableHead>
          <TableHead>קבוצת וואטסאפ</TableHead>
          <TableHead>פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((cls) => (
          <TableRow key={cls.id}>
            <TableCell>{cls.number}</TableCell>
            <TableCell>{cls.name}</TableCell>
            <TableCell>
              <WhatsAppGroupSelect
                classId={cls.id}
                currentJid={cls.whatsappJid}
                groups={groups}
                waConnected={waConnected}
              />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <ClassForm
                  classData={cls}
                  trigger={
                    <Button variant="outline" size="sm">
                      עריכה
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteClass(cls.id)}
                >
                  מחיקה
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
