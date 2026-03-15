import { Suspense } from "react";
import { getTeachers } from "@/actions/teachers";
import { getClasses } from "@/actions/classes";
import { getActiveTimeSlots } from "@/actions/timeslots";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { DateNavigator } from "@/components/schedule/DateNavigator";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || new Date().toISOString().split("T")[0];

  const [teachers, classes, timeSlots] = await Promise.all([
    getTeachers(),
    getClasses(),
    getActiveTimeSlots(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מערכת שעות</h1>
        <Suspense>
          <DateNavigator date={date} />
        </Suspense>
      </div>
      <ScheduleGrid
        date={date}
        teachers={teachers}
        classes={classes}
        timeSlots={timeSlots}
      />
    </div>
  );
}
