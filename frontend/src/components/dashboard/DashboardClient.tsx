"use client";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import type { LiveDashboardData } from "@/hooks/useDashboardStats";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardClient({ initial }: { initial: LiveDashboardData }) {
  const { data, refreshing, refresh, updatedAt } = useDashboardStats(initial);

  return (
    <DashboardOverview
      clients={data.clients}
      loyalty={data.loyalty}
      logs={data.logs}
      feedback={data.feedback}
      updatedAt={updatedAt}
      refreshing={refreshing}
      onRefresh={refresh}
    />
  );
}
