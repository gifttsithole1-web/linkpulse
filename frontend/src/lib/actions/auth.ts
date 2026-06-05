"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";
import { createStaffSessionCookie } from "@/lib/auth/staff";

export async function createStaffSessionAction(idToken: string) {
  try {
    if (!idToken?.trim()) {
      return { ok: false as const, error: "Missing sign-in token." };
    }
    const sessionCookie = await createStaffSessionCookie(idToken);
    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not start session.",
    };
  }
}

export async function logoutStaffAction() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true as const };
}
