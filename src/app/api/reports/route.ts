import { NextResponse } from "next/server";
import { createReport, listReports } from "@/lib/reports";
import type { ReportType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId") || undefined;
  const ref = searchParams.get("ref") || undefined;
  const type = (searchParams.get("type") || undefined) as ReportType | undefined;
  const reports = await listReports({ barrioId, ref, type });
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = await createReport(body);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido guardar el aporte.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
