"use client";

import { useState } from "react";
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
import { createTeacher, updateTeacher } from "@/actions/teachers";
import type { Teacher } from "@/types";

export function TeacherForm({
  teacher,
  trigger,
}: {
  teacher?: Teacher;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(teacher?.name ?? "");
  const [meetingLink, setMeetingLink] = useState(teacher?.meetingLink ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (teacher) {
      await updateTeacher(teacher.id, { name, meetingLink });
    } else {
      await createTeacher({ name, meetingLink });
    }
    setOpen(false);
    if (!teacher) {
      setName("");
      setMeetingLink("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teacher ? "עריכת מורה" : "הוספת מורה"}</DialogTitle>
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
            <Label htmlFor="meetingLink">קישור למפגש</Label>
            <Input
              id="meetingLink"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              dir="ltr"
              placeholder="https://..."
            />
          </div>
          <Button type="submit">{teacher ? "עדכון" : "הוספה"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
