import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
} from "@/lib/api";
import {
  getPriorPeriodBounds,
  getTimeframeBounds,
  isInTimeframe,
  type DashboardTimeframe,
  type PresetDays,
  type TimeframeDays,
} from "@/lib/dashboard-timeframe";

export type { DashboardTimeframe, PresetDays, TimeframeDays };

export function filterByTimeframe<T extends { created_at?: string }>(
  items: T[],
  timeframe: DashboardTimeframe,
): T[] {
  return items.filter((item) => isInTimeframe(item.created_at, timeframe));
}

/** @deprecated Use isInTimeframe with DashboardTimeframe */
export function isWithinDays(
  iso: string | undefined,
  days: TimeframeDays,
): boolean {
  return isInTimeframe(iso, { kind: "preset", days });
}

export function channelPercents(logs: CommunicationLog[]) {
  const total = logs.length;
  const channels = [
    { key: "email" as const, label: "Email" },
    { key: "sms" as const, label: "SMS" },
    { key: "whatsapp" as const, label: "WhatsApp" },
  ];
  if (!total) {
    return channels.map((c) => ({ label: c.label, pct: 0 }));
  }
  return channels.map((c) => ({
    label: c.label,
    pct: Math.round(
      (logs.filter((l) => l.channel === c.key).length / total) * 100,
    ),
  }));
}

export function topSegment(clients: Client[]) {
  const retail = clients.filter((c) => c.account_type === "retail").length;
  const corporate = clients.filter((c) => c.account_type === "corporate").length;
  if (corporate > retail) {
    return { label: "Corporate", count: corporate };
  }
  return { label: "Retail", count: retail };
}

export function winRate(logs: CommunicationLog[]): number | null {
  if (!logs.length) return null;
  const wins = logs.filter((l) =>
    ["sent", "delivered"].includes(l.status),
  ).length;
  return Math.round((wins / logs.length) * 100);
}

export function periodChangePct(current: number, previous: number) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { direction: "up" as const, value: 100 };
  const pct = ((current - previous) / previous) * 100;
  if (pct >= 0) {
    return { direction: "up" as const, value: Math.round(pct * 10) / 10 };
  }
  return { direction: "down" as const, value: Math.round(Math.abs(pct) * 10) / 10 };
}

export function itemsInPriorPeriod<T extends { created_at?: string }>(
  items: T[],
  timeframe: DashboardTimeframe,
) {
  const { start, end } = getPriorPeriodBounds(timeframe);
  return items.filter((item) => {
    if (!item.created_at) return false;
    const d = new Date(item.created_at);
    return d >= start && d < end;
  });
}

export function clientsBetween(
  clients: Client[],
  start: Date,
  end: Date,
): number {
  return clients.filter((c) => {
    if (!c.created_at) return false;
    const d = new Date(c.created_at);
    return d >= start && d <= end;
  }).length;
}

/** @deprecated Use clientsBetween with getTimeframeBounds */
export function clientsInRange(
  clients: Client[],
  startDays: number,
  endDays: number,
) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - endDays);
  const end = new Date(now);
  end.setDate(end.getDate() - startDays);
  return clientsBetween(clients, start, end);
}

export function activityBuckets(
  logs: CommunicationLog[],
  feedback: FeedbackSubmission[],
  timeframe: DashboardTimeframe,
  bucketCount = 12,
) {
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const { start, end } = getTimeframeBounds(timeframe);
  const spanMs = Math.max(end.getTime() - start.getTime(), 60_000);
  const msPerBucket = spanMs / bucketCount;

  const bump = (iso: string | undefined) => {
    if (!iso) return;
    const t = new Date(iso).getTime();
    if (t < start.getTime() || t > end.getTime()) return;
    const age = end.getTime() - t;
    const idx = Math.min(bucketCount - 1, Math.floor(age / msPerBucket));
    const reversed = bucketCount - 1 - idx;
    buckets[reversed] += 1;
  };

  logs.forEach((l) => bump(l.created_at));
  feedback.forEach((f) => bump(f.created_at));
  const max = Math.max(...buckets, 1);
  return buckets.map((n) => Math.round((n / max) * 100));
}

export function engagementByWeekday(
  logs: CommunicationLog[],
  feedback: FeedbackSubmission[],
  timeframe: DashboardTimeframe,
) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = Array(7).fill(0);
  const { start, end } = getTimeframeBounds(timeframe);

  const bump = (iso: string | undefined) => {
    if (!iso) return;
    const d = new Date(iso);
    if (d < start || d > end) return;
    const day = (d.getDay() + 6) % 7;
    counts[day] += 1;
  };

  logs.forEach((l) => bump(l.created_at));
  feedback.forEach((f) => bump(f.created_at));
  const max = Math.max(...counts, 1);
  return labels.map((label, i) => ({
    label,
    height: Math.round((counts[i] / max) * 100),
    count: counts[i],
  }));
}

export function downloadDashboardCsv(payload: {
  clients: Client[];
  logs: CommunicationLog[];
  feedback: FeedbackSubmission[];
  loyaltyCount: number;
  timeframeLabel: string;
  fileSuffix: string;
}) {
  const lines = [
    "LinkPulse dashboard export",
    `Timeframe,${payload.timeframeLabel}`,
    "",
    "Metric,Value",
    `Clients,${payload.clients.length}`,
    `Loyalty accounts,${payload.loyaltyCount}`,
    `Messages,${payload.logs.length}`,
    `Feedback,${payload.feedback.length}`,
    "",
    "Clients",
    "id,name,email,account_type",
    ...payload.clients.map(
      (c) =>
        `${c.id},"${c.name.replace(/"/g, '""')}","${c.email.replace(/"/g, '""')}",${c.account_type}`,
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `linkpulse-dashboard-${payload.fileSuffix}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
