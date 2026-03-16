"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getHebrewDateString, formatGregorianDate } from "@/lib/hebrew-date";

function offsetDate(date: string, offset: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateNavigator({ date }: { date: string }) {
  const currentDate = new Date(date + "T00:00:00");
  const hebrewDate = getHebrewDateString(currentDate);
  const gregorianDate = formatGregorianDate(date);

  const prevDate = offsetDate(date, -1);
  const nextDate = offsetDate(date, 1);
  const today = offsetDate(new Date().toISOString().split("T")[0], 0);

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" render={<Link href={`/schedule?date=${prevDate}`} />}>
        יום קודם
      </Button>
      <div className="text-center">
        <div className="text-lg font-bold">{hebrewDate}</div>
        <div className="text-sm text-muted-foreground">{gregorianDate}</div>
      </div>
      <Button variant="outline" size="sm" render={<Link href={`/schedule?date=${nextDate}`} />}>
        יום הבא
      </Button>
      <Button variant="ghost" size="sm" render={<Link href={`/schedule?date=${today}`} />}>
        היום
      </Button>
    </div>
  );
}
