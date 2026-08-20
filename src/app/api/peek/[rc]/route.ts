import { NextResponse } from "next/server";
import { loadFincaPeek } from "@/lib/peek";
import { compactRef, isCadastralRef } from "@/lib/parse";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ rc: string }> }) {
  const { rc: raw } = await params;
  const rc = compactRef(raw);
  if (!isCadastralRef(rc)) {
    return NextResponse.json({ error: "Referencia catastral no válida." }, { status: 400 });
  }
  try {
    const peek = await loadFincaPeek(rc);
    return NextResponse.json(peek, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido leer esa parcela.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
