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
import { createClass, updateClass } from "@/actions/classes";
import type { Class } from "@/types";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (classData) {
      await updateClass(classData.id, { name, number: Number(number) });
    } else {
      await createClass({ name, number: Number(number) });
    }
    setOpen(false);
    if (!classData) {
      setName("");
      setNumber("");
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
          <Button type="submit">{classData ? "עדכון" : "הוספה"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
