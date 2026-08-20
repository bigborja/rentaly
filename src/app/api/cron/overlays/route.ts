import { NextRequest, NextResponse } from "next/server";
import { ingestTouristLicenses } from "@/lib/ingest-vut";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  try {
    const vut = await ingestTouristLicenses(120);
    return NextResponse.json({ ok: true, vut });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestión fallida";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
