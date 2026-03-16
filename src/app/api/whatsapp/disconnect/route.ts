import { whatsapp } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await whatsapp.logout();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
