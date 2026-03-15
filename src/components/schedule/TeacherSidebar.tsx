"use client";

import { TeacherChip } from "./TeacherChip";
import type { Teacher } from "@/types";

export function TeacherSidebar({ teachers }: { teachers: Teacher[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">מורים</h3>
      <div className="flex flex-wrap gap-2">
        {teachers.map((teacher) => (
          <TeacherChip
            key={teacher.id}
            id={`sidebar-teacher-${teacher.id}`}
            teacherId={teacher.id}
            teacherName={teacher.name}
          />
        ))}
      </div>
    </div>
  );
}
