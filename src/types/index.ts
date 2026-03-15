import type { Teacher, Class, TimeSlot, Assignment } from "@prisma/client";

export type { Teacher, Class, TimeSlot, Assignment };

export type AssignmentWithRelations = Assignment & {
  teacher: Teacher;
  class: Class;
  timeSlot: TimeSlot;
};
