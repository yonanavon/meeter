"use client";

import { useDroppable } from "@dnd-kit/core";
import { TeacherChip } from "./TeacherChip";
import type { AssignmentWithRelations } from "@/types";

interface ScheduleCellProps {
  classId: number;
  timeSlotId: number;
  assignment?: AssignmentWithRelations;
  isConflict: boolean;
  onDelete: (id: number) => void;
}

export function ScheduleCell({
  classId,
  timeSlotId,
  assignment,
  isConflict,
  onDelete,
}: ScheduleCellProps) {
  const droppableId = `cell-${classId}-${timeSlotId}`;
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { classId, timeSlotId },
  });

  return (
    <td
      ref={setNodeRef}
      className={`border p-2 text-center align-middle transition-colors ${
        isOver ? "bg-primary/10" : ""
      } ${isConflict ? "bg-red-50" : ""}`}
      style={{ minWidth: 100, minHeight: 40 }}
    >
      {assignment && (
        <div className="group relative flex items-center justify-center">
          <TeacherChip
            id={`assignment-${assignment.id}`}
            teacherId={assignment.teacherId}
            teacherName={assignment.teacher.name}
            assignmentId={assignment.id}
            isConflict={isConflict}
          />
          <button
            onClick={() => onDelete(assignment.id)}
            className="absolute -left-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white group-hover:flex"
            title="הסר שיבוץ"
          >
            ×
          </button>
        </div>
      )}
    </td>
  );
}
