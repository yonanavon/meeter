"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";

interface TeacherChipProps {
  id: string;
  teacherId: number;
  teacherName: string;
  assignmentId?: number;
  isConflict?: boolean;
}

export function TeacherChip({
  id,
  teacherId,
  teacherName,
  assignmentId,
  isConflict,
}: TeacherChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { teacherId, teacherName, assignmentId },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Badge
        variant="secondary"
        className={`cursor-grab whitespace-nowrap ${
          isConflict
            ? "border-red-400 bg-red-100 text-red-800"
            : "hover:bg-secondary/80"
        }`}
      >
        {teacherName}
      </Badge>
    </div>
  );
}
