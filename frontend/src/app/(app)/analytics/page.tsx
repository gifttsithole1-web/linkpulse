import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { getNavItemByHref } from "@/config/crm-navigation";
import {
  getClients,
  getCommunicationLogs,
  getFeedbackSubmissions,
  getLoyaltyAccounts,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const nav = getNavItemByHref("/analytics");
  const [clients, logs, feedback, loyalty] = await Promise.all([
    getClients({ per_page: 500 }),
    getCommunicationLogs(),
    getFeedbackSubmissions(),
    getLoyaltyAccounts(),
  ]);

  return (
    <CrmPageShell item={nav}>
      <AnalyticsClient
        initial={{
          updatedAt: new Date().toISOString(),
          clients: clients?.data ?? [],
          logs: logs?.data ?? [],
          feedback: feedback?.data ?? [],
          loyalty: loyalty?.data ?? [],
        }}
      />
    </CrmPageShell>
  );
}
