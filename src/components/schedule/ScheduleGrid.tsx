"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { ScheduleCell } from "./ScheduleCell";
import { TeacherSidebar } from "./TeacherSidebar";
import type {
  Teacher,
  Class,
  TimeSlot,
  AssignmentWithRelations,
} from "@/types";

interface ScheduleGridProps {
  date: string;
  teachers: Teacher[];
  classes: Class[];
  timeSlots: TimeSlot[];
}

export function ScheduleGrid({
  date,
  teachers,
  classes,
  timeSlots,
}: ScheduleGridProps) {
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchAssignments = useCallback(async () => {
    const res = await fetch(`/api/assignments?date=${date}`);
    const data = await res.json();
    setAssignments(data);
  }, [date]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Find conflicts: same teacher, same timeSlot, different classes
  function getConflicts(): Set<number> {
    const conflictIds = new Set<number>();
    const grouped = new Map<string, AssignmentWithRelations[]>();

    for (const a of assignments) {
      const key = `${a.teacherId}-${a.timeSlotId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(a);
    }

    for (const group of grouped.values()) {
      if (group.length > 1) {
        for (const a of group) conflictIds.add(a.id);
      }
    }

    return conflictIds;
  }

  const conflicts = getConflicts();

  function getAssignment(classId: number, timeSlotId: number) {
    return assignments.find(
      (a) => a.classId === classId && a.timeSlotId === timeSlotId
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { teacherName } = event.active.data.current as {
      teacherName: string;
    };
    setActiveTeacher(teacherName);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTeacher(null);
    const { over, active } = event;
    if (!over) return;

    const { classId, timeSlotId } = over.data.current as {
      classId: number;
      timeSlotId: number;
    };
    const { teacherId, assignmentId } = active.data.current as {
      teacherId: number;
      assignmentId?: number;
    };

    if (assignmentId) {
      // Move existing assignment
      await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assignmentId, classId, timeSlotId }),
      });
    } else {
      // Create new assignment
      await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, teacherId, classId, timeSlotId }),
      });
    }

    fetchAssignments();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
    fetchAssignments();
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <TeacherSidebar teachers={teachers} />

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-sm font-medium">שעה</th>
                {classes.map((cls) => (
                  <th key={cls.id} className="border p-2 text-sm font-medium">
                    {cls.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.id}>
                  <td className="border bg-muted/50 p-2 text-center text-sm">
                    <div className="font-medium">{slot.label}</div>
                    <div
                      className="text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {slot.startTime}–{slot.endTime}
                    </div>
                  </td>
                  {classes.map((cls) => {
                    const assignment = getAssignment(cls.id, slot.id);
                    return (
                      <ScheduleCell
                        key={`${cls.id}-${slot.id}`}
                        classId={cls.id}
                        timeSlotId={slot.id}
                        assignment={assignment}
                        isConflict={
                          assignment ? conflicts.has(assignment.id) : false
                        }
                        onDelete={handleDelete}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DragOverlay>
        {activeTeacher ? (
          <Badge variant="secondary" className="cursor-grabbing shadow-lg">
            {activeTeacher}
          </Badge>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
