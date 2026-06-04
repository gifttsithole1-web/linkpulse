import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  getClients,
  getCommunicationLogs,
  getFeedbackSubmissions,
  getLoyaltyAccounts,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clients, loyalty, logs, feedback] = await Promise.all([
    getClients({ per_page: 500 }),
    getLoyaltyAccounts(),
    getCommunicationLogs(),
    getFeedbackSubmissions(),
  ]);

  return (
    <DashboardClient
      initial={{
        updatedAt: new Date().toISOString(),
        clients: clients?.data ?? [],
        loyalty: loyalty?.data ?? [],
        logs: logs?.data ?? [],
        feedback: feedback?.data ?? [],
      }}
    />
  );
}
