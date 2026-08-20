import { NextResponse } from "next/server";
import { searchMadrid } from "@/lib/catastro";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  if (q.length < 3) {
    return NextResponse.json(
      { error: "Escribe al menos 3 caracteres: calle y número, o una referencia catastral." },
      { status: 400 },
    );
  }
  try {
    const result = await searchMadrid(q);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido consultar el Catastro.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
