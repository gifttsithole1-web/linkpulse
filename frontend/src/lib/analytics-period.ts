import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
} from "@/lib/api";
import { periodChangePct } from "@/lib/dashboard-stats";

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export const ANALYTICS_PERIODS: AnalyticsPeriod[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

export const PERIOD_CONFIG: Record<
  AnalyticsPeriod,
  { days: number; label: string; shortLabel: string; buckets: number }
> = {
  daily: { days: 1, label: "Today", shortLabel: "daily", buckets: 12 },
  weekly: { days: 7, label: "Last 7 days", shortLabel: "weekly", buckets: 7 },
  monthly: { days: 30, label: "Last 30 days", shortLabel: "monthly", buckets: 12 },
  yearly: { days: 365, label: "Last year", shortLabel: "yearly", buckets: 12 },
};

export function periodDays(period: AnalyticsPeriod): number {
  return PERIOD_CONFIG[period].days;
}

export function isWithinPeriodDays(
  iso: string | undefined,
  days: number,
): boolean {
  if (!iso) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(iso) >= cutoff;
}

export function filterByPeriodDays<T extends { created_at?: string }>(
  items: T[],
  days: number,
): T[] {
  return items.filter((item) => isWithinPeriodDays(item.created_at, days));
}

export function itemsInPriorPeriodDays<T extends { created_at?: string }>(
  items: T[],
  days: number,
): T[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days * 2);
  const end = new Date(now);
  end.setDate(end.getDate() - days);
  return items.filter((item) => {
    if (!item.created_at) return false;
    const d = new Date(item.created_at);
    return d >= start && d < end;
  });
}

export function countInRange(
  items: { created_at?: string }[],
  startDays: number,
  endDays: number,
): number {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - endDays);
  const end = new Date(now);
  end.setDate(end.getDate() - startDays);
  return items.filter((item) => {
    if (!item.created_at) return false;
    const d = new Date(item.created_at);
    return d >= start && d < end;
  }).length;
}

export function activitySparkline(
  logs: CommunicationLog[],
  feedback: FeedbackSubmission[],
  days: number,
  bucketCount: number,
): number[] {
  const buckets = Array.from({ length: bucketCount }, () => 0);
  const now = new Date();
  const msPerBucket = (days * 24 * 60 * 60 * 1000) / bucketCount;

  const bump = (iso: string | undefined) => {
    if (!iso) return;
    const t = new Date(iso).getTime();
    const age = now.getTime() - t;
    if (age < 0 || age > days * 24 * 60 * 60 * 1000) return;
    const idx = Math.min(bucketCount - 1, Math.floor(age / msPerBucket));
    const reversed = bucketCount - 1 - idx;
    buckets[reversed] += 1;
  };

  logs.forEach((l) => bump(l.created_at));
  feedback.forEach((f) => bump(f.created_at));
  const max = Math.max(...buckets, 1);
  return buckets.map((n) => Math.round((n / max) * 100));
}

export type PeriodMetric = {
  value: number;
  growth: ReturnType<typeof periodChangePct>;
  sub: string;
  sparkline: number[];
};

export function buildPeriodSnapshot(
  clients: Client[],
  logs: CommunicationLog[],
  feedback: FeedbackSubmission[],
  period: AnalyticsPeriod,
): {
  period: AnalyticsPeriod;
  config: (typeof PERIOD_CONFIG)[AnalyticsPeriod];
  activeClients: PeriodMetric;
  newContacts: PeriodMetric;
  messages: PeriodMetric;
  feedback: PeriodMetric;
  whatsappReady: PeriodMetric;
  qrLeads: PeriodMetric;
} {
  const config = PERIOD_CONFIG[period];
  const { days, buckets } = config;

  const logsInPeriod = filterByPeriodDays(logs, days);
  const feedbackInPeriod = filterByPeriodDays(feedback, days);
  const sparkline = activitySparkline(logsInPeriod, feedbackInPeriod, days, buckets);

  const subSuffix = config.shortLabel;

  const newCurrent = countInRange(clients, 0, days);
  const newPrior = countInRange(clients, days, days * 2);

  const msgCurrent = logsInPeriod.length;
  const msgPrior = itemsInPriorPeriodDays(logs, days).length;

  const fbCurrent = feedbackInPeriod.length;
  const fbPrior = itemsInPriorPeriodDays(feedback, days).length;

  const whatsappTotal = clients.filter((c) => c.whatsapp_number).length;
  const whatsappInPeriod = filterByPeriodDays(
    clients.filter((c) => c.whatsapp_number),
    days,
  ).length;
  const whatsappPrior = itemsInPriorPeriodDays(
    clients.filter((c) => c.whatsapp_number),
    days,
  ).length;

  const qrInPeriod = filterByPeriodDays(
    clients.filter((c) => c.source === "qr"),
    days,
  ).length;
  const qrPrior = itemsInPriorPeriodDays(
    clients.filter((c) => c.source === "qr"),
    days,
  ).length;

  return {
    period,
    config,
    activeClients: {
      value: clients.length,
      growth: periodChangePct(newCurrent, newPrior),
      sub: `${fbCurrent} feedback · ${msgCurrent} messages (${subSuffix})`,
      sparkline,
    },
    newContacts: {
      value: newCurrent,
      growth: periodChangePct(newCurrent, newPrior),
      sub: `${config.label} sign-ups`,
      sparkline,
    },
    messages: {
      value: msgCurrent,
      growth: periodChangePct(msgCurrent, msgPrior),
      sub: `Logged in ${config.label.toLowerCase()}`,
      sparkline,
    },
    feedback: {
      value: fbCurrent,
      growth: periodChangePct(fbCurrent, fbPrior),
      sub: `Submissions in ${config.label.toLowerCase()}`,
      sparkline,
    },
    whatsappReady: {
      value: whatsappTotal,
      growth: periodChangePct(whatsappInPeriod, whatsappPrior),
      sub: `${whatsappInPeriod} added in ${subSuffix}`,
      sparkline,
    },
    qrLeads: {
      value: clients.filter((c) => c.source === "qr").length,
      growth: periodChangePct(qrInPeriod, qrPrior),
      sub: `${qrInPeriod} from QR in ${subSuffix}`,
      sparkline,
    },
  };
}
