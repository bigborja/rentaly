import { NextResponse } from "next/server";
import { searchGestoras } from "@/lib/gestoras";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  if (q.length === 1) {
    return NextResponse.json(
      { error: "Escribe al menos 2 caracteres de la razón social, o un CIF." },
      { status: 400 },
    );
  }
  const result = await searchGestoras(q);
  return NextResponse.json(result);
}
