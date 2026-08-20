import { NextResponse } from "next/server";
import { reportStats } from "@/lib/reports";
import { BARRIOS } from "@/lib/barrios-data";

export async function GET() {
  const stats = await reportStats();
  return NextResponse.json({
    ...stats,
    barrios: BARRIOS.length,
    districts: new Set(BARRIOS.map((barrio) => barrio.districtId)).size,
  });
}
