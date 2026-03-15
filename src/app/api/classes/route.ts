import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const classes = await prisma.class.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json(classes);
}
