import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const timeSlots = await prisma.timeSlot.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json(timeSlots);
}
