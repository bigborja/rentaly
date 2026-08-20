import { NextRequest, NextResponse } from "next/server";
import { createReport, listReports } from "@/lib/reports";
import { toPublicReport, type ReportType } from "@/domain";
import { SESSION_COOKIE, userFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barrioId = searchParams.get("barrioId") || undefined;
  const ref = searchParams.get("ref") || undefined;
  const type = (searchParams.get("type") || undefined) as ReportType | undefined;
  const mine = searchParams.get("mine") === "1";
  const user = await userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (mine && !user) {
    return NextResponse.json({ error: "Entra primero." }, { status: 401 });
  }
  const reports = await listReports({
    barrioId,
    ref,
    type,
    userId: mine ? user?.id : undefined,
  });
  return NextResponse.json({
    reports: mine ? reports : reports.map(toPublicReport),
  });
}

export async function POST(request: NextRequest) {
  const user = await userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json(
      { error: "Para publicar necesitas una cuenta. El relato sigue siendo anónimo en público." },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const report = await createReport({
      ...body,
      author: user.nickname,
      userId: user.id,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido guardar el aporte.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
