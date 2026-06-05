import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { verifyStaffSession } from "@/lib/auth/staff";

export async function getStaffSession(): Promise<DecodedIdToken | null> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    return await verifyStaffSession(session);
  } catch {
    return null;
  }
}

export async function requireStaffSession(): Promise<DecodedIdToken> {
  const session = await getStaffSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
