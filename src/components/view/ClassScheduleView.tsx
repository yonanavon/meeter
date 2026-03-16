"use client";

import { useState, useEffect, useCallback } from "react";
import type { AssignmentWithRelations } from "@/types";
import { getHebrewDateString } from "@/lib/hebrew-date";

const SLOT_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", accent: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-violet-50", border: "border-violet-200", accent: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-amber-50", border: "border-amber-200", accent: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-200", accent: "text-rose-600", badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-cyan-50", border: "border-cyan-200", accent: "text-cyan-600", badge: "bg-cyan-100 text-cyan-700" },
  { bg: "bg-fuchsia-50", border: "border-fuchsia-200", accent: "text-fuchsia-600", badge: "bg-fuchsia-100 text-fuchsia-700" },
  { bg: "bg-lime-50", border: "border-lime-200", accent: "text-lime-600", badge: "bg-lime-100 text-lime-700" },
];

export function ClassScheduleView({
  classNumber,
  date,
}: {
  classNumber: string;
  date: string;
}) {
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [className, setClassName] = useState("");
  const [loaded, setLoaded] = useState(false);

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
    setLoaded(true);
  }, [classNumber, date]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const currentDate = new Date(date + "T00:00:00");
  const hebrewDate = getHebrewDateString(currentDate);

  return (
    <div className="mx-auto w-full max-w-[416px] p-3 font-sans">
      {/* Header */}
      <div className="mb-4 rounded-xl bg-gradient-to-l from-blue-600 to-violet-600 px-4 py-3 text-center text-white shadow-md">
        <h1 className="text-lg font-bold leading-tight">
          {className || `כיתה ${classNumber}`}
        </h1>
        <p className="mt-0.5 text-sm text-blue-100">{hebrewDate}</p>
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        {assignments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center">
            <p className="text-sm font-medium text-gray-400">
              {loaded ? "לא הוזנו שיעורים היום במערכת" : "טוען מערכת שיעורים..."}
            </p>
          </div>
        ) : (
          assignments.map((a, i) => {
            const color = SLOT_COLORS[i % SLOT_COLORS.length];
            return (
              <div
                key={a.id}
                className={`rounded-lg border ${color.border} ${color.bg} p-3 transition-shadow hover:shadow-sm`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${color.accent}`}>
                        {a.timeSlot.label}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${color.badge}`}
                        dir="ltr"
                      >
                        {a.timeSlot.startTime}–{a.timeSlot.endTime}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-800">
                      {a.teacher.name}
                    </div>
                  </div>
                  {a.teacher.meetingLink && (
                    <a
                      href={a.teacher.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg bg-gradient-to-l from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow"
                    >
                      כניסה
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
