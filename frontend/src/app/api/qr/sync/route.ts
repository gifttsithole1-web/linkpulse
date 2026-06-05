import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/auth/api-auth";
import { syncQrSubmissionsFromFirestore } from "@/lib/firestore/crm";

export async function POST() {
  const auth = await requireStaffApi();
  if (auth.unauthorized) return auth.unauthorized;

  try {
    const synced = await syncQrSubmissionsFromFirestore();
    return NextResponse.json({ synced });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Firebase admin not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
