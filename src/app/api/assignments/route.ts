import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const assignments = await prisma.assignment.findMany({
    where: { date },
    include: { teacher: true, class: true, timeSlot: true },
  });
  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, teacherId, classId, timeSlotId } = body;

  // Remove existing assignment in this cell
  await prisma.assignment.deleteMany({
    where: { date, classId, timeSlotId },
  });

  const assignment = await prisma.assignment.create({
    data: { date, teacherId, classId, timeSlotId },
    include: { teacher: true, class: true, timeSlot: true },
  });
  return NextResponse.json(assignment);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, classId, timeSlotId } = body;

  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Remove any assignment already in the target cell
  await prisma.assignment.deleteMany({
    where: {
      date: existing.date,
      classId,
      timeSlotId,
      id: { not: id },
    },
  });

  const assignment = await prisma.assignment.update({
    where: { id },
    data: { classId, timeSlotId },
    include: { teacher: true, class: true, timeSlot: true },
  });
  return NextResponse.json(assignment);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.assignment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
