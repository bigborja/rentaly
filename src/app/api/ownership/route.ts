import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, userFromToken } from "@/lib/auth";
import { createOwnershipClaim, listOwnershipClaims } from "@/lib/ownership-store";
import type { LegalEntityKind, OwnershipSource } from "@/domain";

export async function GET(request: NextRequest) {
  const parcelRef = request.nextUrl.searchParams.get("parcelRef") || "";
  if (!parcelRef) {
    return NextResponse.json({ error: "Falta la referencia catastral." }, { status: 400 });
  }
  try {
    const claims = await listOwnershipClaims(parcelRef);
    return NextResponse.json({ claims });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se han podido leer las entidades.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const user = await userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) {
    return NextResponse.json(
      { error: "Entra con una cuenta. No se guarda ningún dato de persona física titular." },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const claim = await createOwnershipClaim({
      parcelRef: String(body.parcelRef || ""),
      taxId: String(body.taxId || ""),
      legalName: String(body.legalName || ""),
      kind: body.kind as LegalEntityKind | undefined,
      source: (body.source as OwnershipSource | undefined) || "user_verified",
      sourceUrl: body.sourceUrl ? String(body.sourceUrl) : undefined,
    });
    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido guardar la entidad.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
