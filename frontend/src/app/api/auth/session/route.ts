import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";
import { createStaffSessionCookie } from "@/lib/auth/staff";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    if (!body.idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const sessionCookie = await createStaffSessionCookie(body.idToken);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-in failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
