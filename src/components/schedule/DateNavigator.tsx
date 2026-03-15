"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getHebrewDateString, formatGregorianDate } from "@/lib/hebrew-date";

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = new Date(date + "T00:00:00");
  const hebrewDate = getHebrewDateString(currentDate);
  const gregorianDate = formatGregorianDate(date);

  function navigate(offset: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    const dateStr = newDate.toISOString().split("T")[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", dateStr);
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        יום קודם
      </Button>
      <div className="text-center">
        <div className="text-lg font-bold">{hebrewDate}</div>
        <div className="text-sm text-muted-foreground">{gregorianDate}</div>
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate(1)}>
        יום הבא
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const today = new Date().toISOString().split("T")[0];
          const params = new URLSearchParams(searchParams.toString());
          params.set("date", today);
          router.push(`/schedule?${params.toString()}`);
        }}
      >
        היום
      </Button>
    </div>
  );
}
