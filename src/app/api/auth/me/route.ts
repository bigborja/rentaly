import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, updateUser, userFromToken } from "@/lib/auth";
import type { Intent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const current = await userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!current) return NextResponse.json({ error: "Entra primero." }, { status: 401 });
  try {
    const body = await request.json();
    const user = await updateUser(current.id, {
      nickname: body.nickname ? String(body.nickname) : undefined,
      intent: body.intent as Intent | undefined,
      barrioId: body.barrioId ? String(body.barrioId) : undefined,
      onboardingComplete: body.onboardingComplete === true ? true : undefined,
    });
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
