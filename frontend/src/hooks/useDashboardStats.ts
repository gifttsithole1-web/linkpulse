"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardSnapshot } from "@/lib/dashboard-metrics";

export type LiveDashboardData = DashboardSnapshot & {
  updatedAt: string;
};

const REFRESH_MS = 15_000;

export function useDashboardStats(initial: LiveDashboardData) {
  const [data, setData] = useState<LiveDashboardData>(initial);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/stats", {
        cache: "no-store",
      });
      const json = (await res.json()) as LiveDashboardData & { error?: string };
      if (!res.ok) {
        console.error("[dashboard stats]", json.error);
        return;
      }
      setData({
        clients: json.clients ?? [],
        loyalty: json.loyalty ?? [],
        logs: json.logs ?? [],
        feedback: json.feedback ?? [],
        updatedAt: json.updatedAt ?? new Date().toISOString(),
      });
    } catch (e) {
      console.error("[dashboard stats]", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onCustom = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("linkpulse:refresh-stats", onCustom);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("linkpulse:refresh-stats", onCustom);
    };
  }, [refresh]);

  return { data, refreshing, refresh, updatedAt: data.updatedAt };
}

export function notifyDashboardRefresh() {
  window.dispatchEvent(new Event("linkpulse:refresh-stats"));
}
