"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClasses() {
  return prisma.class.findMany({ orderBy: { number: "asc" } });
}

export async function createClass(data: { name: string; number: number }) {
  await prisma.class.create({ data });
  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
}

export async function updateClass(
  id: number,
  data: { name: string; number: number }
) {
  await prisma.class.update({ where: { id }, data });
  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
}

export async function deleteClass(id: number) {
  await prisma.class.delete({ where: { id } });
  revalidatePath("/admin/classes");
  revalidatePath("/schedule");
}
