import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { targetDate } = await request.json();
  if (!targetDate) {
    return NextResponse.json(
      { error: "targetDate is required" },
      { status: 400 }
    );
  }

  // Calculate previous day
  const d = new Date(targetDate + "T00:00:00");
  d.setDate(d.getDate() - 1);
  const prevDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const prevAssignments = await prisma.assignment.findMany({
    where: { date: prevDate },
  });

  if (prevAssignments.length === 0) {
    return NextResponse.json({ copied: 0 });
  }

  // Remove existing assignments for target date
  await prisma.assignment.deleteMany({ where: { date: targetDate } });

  // Copy assignments from previous day
  await prisma.assignment.createMany({
    data: prevAssignments.map((a) => ({
      date: targetDate,
      teacherId: a.teacherId,
      classId: a.classId,
      timeSlotId: a.timeSlotId,
    })),
  });

  return NextResponse.json({ copied: prevAssignments.length });
}
