"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AssignmentWithRelations } from "@/types";
import { getHebrewDateString } from "@/lib/hebrew-date";

export function ClassScheduleView({
  classNumber,
  date,
}: {
  classNumber: string;
  date: string;
}) {
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [className, setClassName] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/assignments?date=${date}`);
    const data: AssignmentWithRelations[] = await res.json();
    const filtered = data.filter(
      (a) => a.class.number === Number(classNumber)
    );
    if (filtered.length > 0) {
      setClassName(filtered[0].class.name);
    }
    filtered.sort((a, b) => a.timeSlot.orderIndex - b.timeSlot.orderIndex);
    setAssignments(filtered);
  }, [classNumber, date]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const currentDate = new Date(date + "T00:00:00");
  const hebrewDate = getHebrewDateString(currentDate);

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold">{className || `כיתה ${classNumber}`}</h1>
        <p className="text-sm text-muted-foreground">{hebrewDate}</p>
      </div>
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-center text-muted-foreground">אין שיעורים היום</p>
        ) : (
          assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{a.teacher.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {a.timeSlot.label}
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs" dir="ltr">
                    {a.timeSlot.startTime}–{a.timeSlot.endTime}
                  </Badge>
                </div>
                {a.teacher.meetingLink && (
                  <Button size="sm" render={<a href={a.teacher.meetingLink} target="_blank" rel="noopener noreferrer" />}>
                    כניסה למפגש
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
