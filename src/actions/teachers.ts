"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeachers() {
  return prisma.teacher.findMany({ orderBy: { name: "asc" } });
}

export async function createTeacher(data: {
  name: string;
  meetingLink: string;
}) {
  await prisma.teacher.create({ data });
  revalidatePath("/admin/teachers");
  revalidatePath("/schedule");
}

export async function updateTeacher(
  id: number,
  data: { name: string; meetingLink: string }
) {
  await prisma.teacher.update({ where: { id }, data });
  revalidatePath("/admin/teachers");
  revalidatePath("/schedule");
}

export async function deleteTeacher(id: number) {
  await prisma.teacher.delete({ where: { id } });
  revalidatePath("/admin/teachers");
  revalidatePath("/schedule");
}
