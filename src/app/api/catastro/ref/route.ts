import { NextResponse } from "next/server";
import { lookupByRef } from "@/lib/catastro";
import { compactRef, isCadastralRef } from "@/lib/parse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = compactRef(searchParams.get("ref") || "");
  if (!isCadastralRef(ref)) {
    return NextResponse.json({ error: "Referencia catastral no válida." }, { status: 400 });
  }
  try {
    const property = await lookupByRef(ref);
    return NextResponse.json(property);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido consultar el Catastro.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
