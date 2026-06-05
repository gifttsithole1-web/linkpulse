import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { SESSION_MAX_AGE_SEC } from "@/lib/auth/constants";

export function staffAllowlist(): Set<string> | null {
  const raw = process.env.STAFF_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function assertStaffEmail(email: string | undefined) {
  if (!email) throw new Error("Unauthorized");
  const list = staffAllowlist();
  if (list && !list.has(email.toLowerCase())) {
    throw new Error("This account is not authorized for LinkPulse staff access.");
  }
}

export async function createStaffSessionCookie(idToken: string) {
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  assertStaffEmail(decoded.email);
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SEC * 1000,
  });
}

export async function verifyStaffSession(
  session: string,
): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifySessionCookie(session, true);
  assertStaffEmail(decoded.email);
  return decoded;
}
