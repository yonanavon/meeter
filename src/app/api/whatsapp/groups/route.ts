export const dynamic = "force-dynamic";

import { whatsapp } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const groups = await whatsapp.getGroups();
    return NextResponse.json(groups);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
