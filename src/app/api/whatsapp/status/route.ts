export const dynamic = "force-dynamic";

import { whatsapp } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: whatsapp.getStatus(),
    qr: whatsapp.getQR(),
  });
}
