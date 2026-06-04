"use client";

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { LiveDashboardData } from "@/hooks/useDashboardStats";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function AnalyticsClient({ initial }: { initial: LiveDashboardData }) {
  const { data, refreshing, refresh, updatedAt } = useDashboardStats(initial);

  return (
    <AnalyticsDashboard
      clients={data.clients}
      logs={data.logs}
      feedback={data.feedback}
      loyalty={data.loyalty}
      updatedAt={updatedAt}
      refreshing={refreshing}
      onRefresh={refresh}
    />
  );
}
