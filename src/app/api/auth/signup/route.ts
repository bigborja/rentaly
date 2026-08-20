import { NextResponse } from "next/server";
import { createSession, createUser, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await createUser({
      email: String(body.email || ""),
      password: String(body.password || ""),
      nickname: String(body.nickname || ""),
    });
    const token = await createSession(user.id);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se ha podido crear la cuenta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
