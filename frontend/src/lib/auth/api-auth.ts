import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/require-staff";

export async function requireStaffApi() {
  const session = await getStaffSession();
  if (!session) {
    return { session: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, unauthorized: null };
}
