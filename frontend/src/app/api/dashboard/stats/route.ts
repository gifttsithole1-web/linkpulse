import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/auth/api-auth";
import {
  getClients,
  getCommunicationLogs,
  getFeedbackSubmissions,
  getLoyaltyAccounts,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireStaffApi();
  if (auth.unauthorized) return auth.unauthorized;

  try {
    const [clients, loyalty, logs, feedback] = await Promise.all([
      getClients({ per_page: 500 }),
      getLoyaltyAccounts(),
      getCommunicationLogs(),
      getFeedbackSubmissions(),
    ]);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      clients: clients?.data ?? [],
      loyalty: loyalty?.data ?? [],
      logs: logs?.data ?? [],
      feedback: feedback?.data ?? [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
