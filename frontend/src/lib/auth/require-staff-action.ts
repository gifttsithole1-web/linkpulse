import { getStaffSession } from "@/lib/auth/require-staff";

export async function requireStaffAction() {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("You must sign in to perform this action.");
  }
  return session;
}
