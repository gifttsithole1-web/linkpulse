import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
  LoyaltyAccount,
} from "@/lib/api";
import { channelStats } from "@/lib/engagement-stats";

export type AnalyticsReport = {
  clients: {
    total: number;
    retail: number;
    corporate: number;
    marketingOptIn: number;
    qrSource: number;
    last30Days: number;
  };
  feedback: { total: number; last30Days: number };
  messages: { total: number; channels: ReturnType<typeof channelStats> };
  loyalty: {
    accounts: number;
    totalPoints: number;
    totalLifetime: number;
    topTier: string | null;
  };
  pipeline: Record<string, number>;
};

function daysAgo(iso: string | undefined, days: number) {
  if (!iso) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

export function buildAnalyticsReport(
  clients: Client[],
  logs: CommunicationLog[],
  feedback: FeedbackSubmission[],
  loyalty: LoyaltyAccount[],
): AnalyticsReport {
  const pipeline: Record<string, number> = {};
  for (const c of clients) {
    const stage = c.pipeline_stage ?? "lead";
    pipeline[stage] = (pipeline[stage] ?? 0) + 1;
  }

  const tierCounts = new Map<string, number>();
  let totalPoints = 0;
  let totalLifetime = 0;
  for (const a of loyalty) {
    totalPoints += a.points_balance;
    totalLifetime += a.lifetime_points ?? 0;
    tierCounts.set(a.tier_level, (tierCounts.get(a.tier_level) ?? 0) + 1);
  }
  const topTier =
    [...tierCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    clients: {
      total: clients.length,
      retail: clients.filter((c) => c.account_type === "retail").length,
      corporate: clients.filter((c) => c.account_type === "corporate").length,
      marketingOptIn: clients.filter((c) => c.marketing_opt_in).length,
      qrSource: clients.filter((c) => c.source === "qr").length,
      last30Days: clients.filter((c) => daysAgo(c.created_at, 30)).length,
    },
    feedback: {
      total: feedback.length,
      last30Days: feedback.filter((f) => daysAgo(f.created_at, 30)).length,
    },
    messages: {
      total: logs.length,
      channels: channelStats(logs),
    },
    loyalty: {
      accounts: loyalty.length,
      totalPoints,
      totalLifetime,
      topTier,
    },
    pipeline,
  };
}

export function analyticsToCsv(report: AnalyticsReport, clients: Client[]): string {
  const lines: string[] = [
    "LinkPulse Analytics Export",
    `Generated,${new Date().toISOString()}`,
    "",
    "Metric,Value",
    `Total clients,${report.clients.total}`,
    `Retail,${report.clients.retail}`,
    `Corporate,${report.clients.corporate}`,
    `Marketing opt-in,${report.clients.marketingOptIn}`,
    `QR source clients,${report.clients.qrSource}`,
    `New clients (30d),${report.clients.last30Days}`,
    `Feedback submissions,${report.feedback.total}`,
    `Messages logged,${report.messages.total}`,
    `Loyalty accounts,${report.loyalty.accounts}`,
    `Points outstanding,${report.loyalty.totalPoints}`,
    "",
    "Client,Name,Email,Type,Stage,Source,Created",
  ];
  for (const c of clients) {
    lines.push(
      [
        c.id,
        `"${(c.company_name || c.name).replace(/"/g, '""')}"`,
        c.email,
        c.account_type,
        c.pipeline_stage ?? "lead",
        c.source ?? "",
        c.created_at ?? "",
      ].join(","),
    );
  }
  return lines.join("\n");
}
