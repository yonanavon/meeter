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
import { createTimeSlot, updateTimeSlot } from "@/actions/timeslots";
import type { TimeSlot } from "@/types";

export function TimeSlotForm({
  timeSlot,
  trigger,
  nextOrderIndex,
}: {
  timeSlot?: TimeSlot;
  trigger: React.ReactNode;
  nextOrderIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(timeSlot?.label ?? "");
  const [startTime, setStartTime] = useState(timeSlot?.startTime ?? "");
  const [endTime, setEndTime] = useState(timeSlot?.endTime ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timeSlot) {
      await updateTimeSlot(timeSlot.id, { label, startTime, endTime });
    } else {
      await createTimeSlot({
        label,
        startTime,
        endTime,
        orderIndex: nextOrderIndex ?? 0,
      });
    }
    setOpen(false);
    if (!timeSlot) {
      setLabel("");
      setStartTime("");
      setEndTime("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {timeSlot ? "עריכת שעה" : "הוספת שעה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">תיאור</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">שעת התחלה</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                dir="ltr"
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">שעת סיום</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                dir="ltr"
                required
              />
            </div>
          </div>
          <Button type="submit">{timeSlot ? "עדכון" : "הוספה"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
