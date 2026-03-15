"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTimeSlots() {
  return prisma.timeSlot.findMany({ orderBy: { orderIndex: "asc" } });
}

export async function getActiveTimeSlots() {
  return prisma.timeSlot.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });
}

export async function createTimeSlot(data: {
  label: string;
  startTime: string;
  endTime: string;
  orderIndex: number;
}) {
  await prisma.timeSlot.create({ data });
  revalidatePath("/admin/timeslots");
  revalidatePath("/schedule");
}

export async function updateTimeSlot(
  id: number,
  data: {
    label?: string;
    startTime?: string;
    endTime?: string;
    orderIndex?: number;
    isActive?: boolean;
  }
) {
  await prisma.timeSlot.update({ where: { id }, data });
  revalidatePath("/admin/timeslots");
  revalidatePath("/schedule");
}

export async function deleteTimeSlot(id: number) {
  await prisma.timeSlot.delete({ where: { id } });
  revalidatePath("/admin/timeslots");
  revalidatePath("/schedule");
}
