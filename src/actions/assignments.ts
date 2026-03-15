"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAssignmentsByDate(date: string) {
  return prisma.assignment.findMany({
    where: { date },
    include: { teacher: true, class: true, timeSlot: true },
  });
}

export async function createAssignment(data: {
  date: string;
  teacherId: number;
  classId: number;
  timeSlotId: number;
}) {
  // Remove existing assignment in this cell if any
  await prisma.assignment.deleteMany({
    where: {
      date: data.date,
      classId: data.classId,
      timeSlotId: data.timeSlotId,
    },
  });
  await prisma.assignment.create({ data });
  revalidatePath("/schedule");
}

export async function deleteAssignment(id: number) {
  await prisma.assignment.delete({ where: { id } });
  revalidatePath("/schedule");
}

export async function moveAssignment(
  id: number,
  data: { classId: number; timeSlotId: number }
) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) return;

  // Remove any assignment already in the target cell
  await prisma.assignment.deleteMany({
    where: {
      date: existing.date,
      classId: data.classId,
      timeSlotId: data.timeSlotId,
      id: { not: id },
    },
  });

  await prisma.assignment.update({
    where: { id },
    data: { classId: data.classId, timeSlotId: data.timeSlotId },
  });
  revalidatePath("/schedule");
}
