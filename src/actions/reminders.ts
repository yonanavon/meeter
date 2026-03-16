"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReminderRules() {
  return prisma.reminderRule.findMany({
    include: { sticker: true },
    orderBy: { minutesBefore: "asc" },
  });
}

export async function createReminderRule(data: {
  minutesBefore: number;
  label: string;
  stickerId: number;
}) {
  await prisma.reminderRule.create({ data });
  revalidatePath("/admin/stickers");
}

export async function updateReminderRule(
  id: number,
  data: { minutesBefore?: number; label?: string; stickerId?: number; enabled?: boolean }
) {
  await prisma.reminderRule.update({ where: { id }, data });
  revalidatePath("/admin/stickers");
}

export async function deleteReminderRule(id: number) {
  await prisma.reminderRule.delete({ where: { id } });
  revalidatePath("/admin/stickers");
}
