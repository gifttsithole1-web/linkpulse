import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
  LoyaltyAccount,
} from "@/lib/api";
import type { DashboardTimeframe } from "@/lib/dashboard-timeframe";
import { getPriorPeriodBounds, getTimeframeBounds } from "@/lib/dashboard-timeframe";
import {
  activityBuckets,
  channelPercents,
  clientsBetween,
  engagementByWeekday,
  filterByTimeframe,
  itemsInPriorPeriod,
  periodChangePct,
  topSegment,
  winRate,
} from "@/lib/dashboard-stats";

const DEAL_STAGES = new Set(["quote", "won", "production"]);

export type DashboardSnapshot = {
  clients: Client[];
  loyalty: LoyaltyAccount[];
  logs: CommunicationLog[];
  feedback: FeedbackSubmission[];
};

export type DashboardComputed = {
  activeClients: number;
  dealsCount: number;
  loyaltyMembers: number;
  loyaltyPointsOut: number;
  messagesInPeriod: number;
  feedbackInPeriod: number;
  allMessages: number;
  allFeedback: number;
  segment: ReturnType<typeof topSegment>;
  win: number | null;
  winDelta: ReturnType<typeof periodChangePct>;
  growth: ReturnType<typeof periodChangePct>;
  bars: number[];
  weekdays: ReturnType<typeof engagementByWeekday>;
  channels: ReturnType<typeof channelPercents>;
  recentClients: Client[];
};

export function countDeals(clients: Client[]): number {
  return clients.filter((c) =>
    DEAL_STAGES.has((c.pipeline_stage ?? "lead") as string),
  ).length;
}

export function computeDashboardMetrics(
  snapshot: DashboardSnapshot,
  timeframe: DashboardTimeframe,
  accountFilter: "all" | "retail" | "corporate" = "all",
): DashboardComputed {
  const { clients, loyalty, logs, feedback } = snapshot;

  let filteredClients = clients;
  if (accountFilter !== "all") {
    filteredClients = clients.filter((c) => c.account_type === accountFilter);
  }

  const filteredLogs = filterByTimeframe(logs, timeframe);
  const filteredFeedback = filterByTimeframe(feedback, timeframe);
  const bounds = getTimeframeBounds(timeframe);
  const prior = getPriorPeriodBounds(timeframe);

  const delivered = (list: CommunicationLog[]) =>
    list.filter((l) => ["sent", "delivered"].includes(l.status)).length;

  return {
    activeClients: filteredClients.length,
    dealsCount: countDeals(filteredClients),
    loyaltyMembers: loyalty.length,
    loyaltyPointsOut: loyalty.reduce((s, a) => s + a.points_balance, 0),
    messagesInPeriod: filteredLogs.length,
    feedbackInPeriod: filteredFeedback.length,
    allMessages: logs.length,
    allFeedback: feedback.length,
    segment: topSegment(filteredClients),
    win: winRate(filteredLogs),
    winDelta: periodChangePct(
      delivered(filteredLogs),
      delivered(itemsInPriorPeriod(logs, timeframe)),
    ),
    growth: periodChangePct(
      clientsBetween(clients, bounds.start, bounds.end),
      clientsBetween(clients, prior.start, prior.end),
    ),
    bars: activityBuckets(filteredLogs, filteredFeedback, timeframe),
    weekdays: engagementByWeekday(filteredLogs, filteredFeedback, timeframe),
    channels: channelPercents(filteredLogs),
    recentClients: filteredClients.slice(0, 5),
  };
}
