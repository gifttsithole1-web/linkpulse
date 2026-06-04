"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  FiDownload,
  FiFilter,
  FiMenu,
  FiSearch,
  FiShare2,
} from "react-icons/fi";
import { DashboardTimeframePicker } from "@/components/dashboard/DashboardTimeframePicker";
import { QrLandingPanel } from "@/components/QrLandingPanel";
import { SyncNowButton } from "@/components/SyncNowButton";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";
import { UndoRedoToolbar } from "@/components/undo/UndoRedoToolbar";
import { notifyDashboardRefresh } from "@/hooks/useDashboardStats";
import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
  LoyaltyAccount,
} from "@/lib/api";
import { computeDashboardMetrics } from "@/lib/dashboard-metrics";
import {
  DEFAULT_TIMEFRAME,
  formatTimeframeLabel,
  formatTimeframeShort,
  type DashboardTimeframe,
} from "@/lib/dashboard-timeframe";
import { downloadDashboardCsv, filterByTimeframe } from "@/lib/dashboard-stats";

type MetricFilter = "all" | "deals" | "loyalty" | "messages" | "feedback";
type AccountFilter = "all" | "retail" | "corporate";

export type DashboardOverviewProps = {
  clients: Client[];
  loyalty: LoyaltyAccount[];
  logs: CommunicationLog[];
  feedback: FeedbackSubmission[];
  updatedAt?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function Pill({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "up" | "down" | "accent";
  title?: string;
}) {
  const styles = {
    neutral: "bg-zinc-100 text-zinc-600",
    up: "bg-emerald-50 text-emerald-700",
    down: "bg-rose-50 text-rose-600",
    accent: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
  };
  return (
    <span title={title} className={`dash-pill ${styles[tone]}`}>
      {children}
    </span>
  );
}

const SEARCH_ROUTES: Record<string, string> = {
  contacts: "/contacts",
  contact: "/contacts",
  feedback: "/feedback",
  loyalty: "/loyalty",
  sync: "/acquisition/sync",
  qr: "/acquisition/qr",
  pipeline: "/pipeline",
  messages: "/communications",
  communications: "/communications",
  deals: "/pipeline",
};

function formatUpdated(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

export function DashboardOverview({
  clients,
  loyalty,
  logs,
  feedback,
  updatedAt,
  refreshing,
  onRefresh,
}: DashboardOverviewProps) {
  const router = useRouter();
  const { toggleNav } = useDashboardShell();
  const [timeframe, setTimeframe] = useState<DashboardTimeframe>(DEFAULT_TIMEFRAME);
  const timeframeLabel = formatTimeframeLabel(timeframe);
  const timeframeShort = formatTimeframeShort(timeframe);
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("all");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(
    () =>
      computeDashboardMetrics(
        { clients, loyalty, logs, feedback },
        timeframe,
        accountFilter,
      ),
    [clients, loyalty, logs, feedback, timeframe, accountFilter],
  );

  const filteredLogs = useMemo(
    () => filterByTimeframe(logs, timeframe),
    [logs, timeframe],
  );
  const filteredFeedback = useMemo(
    () => filterByTimeframe(feedback, timeframe),
    [feedback, timeframe],
  );

  function submitSearch() {
    const q = search.trim().toLowerCase();
    if (!q) return;
    const route = SEARCH_ROUTES[q];
    if (route) {
      router.push(route);
      return;
    }
    router.push(`/contacts?q=${encodeURIComponent(search.trim())}`);
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "LinkPulse overview",
          text: "CRM dashboard",
          url,
        });
        setShareMsg("Shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg("Link copied");
      }
    } catch {
      setShareMsg("Could not share");
    }
    setTimeout(() => setShareMsg(""), 2500);
  }

  function handleDownload() {
    const filteredClients =
      accountFilter === "all"
        ? clients
        : clients.filter((c) => c.account_type === accountFilter);
    downloadDashboardCsv({
      clients: filteredClients,
      logs: filteredLogs,
      feedback: filteredFeedback,
      loyaltyCount: metrics.loyaltyMembers,
      timeframeLabel,
      fileSuffix:
        timeframe.kind === "custom"
          ? "custom"
          : `${timeframe.days}d`,
    });
  }

  const pillClass = (key: MetricFilter) =>
    [
      "dash-pill cursor-pointer transition",
      metricFilter === key
        ? "bg-zinc-900 text-white shadow-sm"
        : "bg-white text-zinc-700 shadow-sm hover:bg-zinc-50",
    ].join(" ");

  const showHero = metricFilter === "all" || metricFilter === "deals";
  const showLoyalty = metricFilter === "all" || metricFilter === "loyalty";
  const showMessages = metricFilter === "all" || metricFilter === "messages";
  const showFeedbackBlock =
    metricFilter === "all" || metricFilter === "feedback";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-zinc-200/60 bg-[var(--dash-bg)] px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <form
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:rounded-[20px] sm:px-4 sm:py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <FiSearch className="h-5 w-5 shrink-0 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts, feedback, loyalty…"
            className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
          />
        </form>
        <UndoRedoToolbar />
        <button
          type="button"
          aria-label="Open menu"
          onClick={toggleNav}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-600 shadow-sm lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </header>

      <main className="app-scroll flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-400 sm:text-3xl">
            LinkPulse overview
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                aria-label="Filter"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm",
                  accountFilter !== "all" ? "ring-2 ring-[var(--dash-accent)]" : "",
                ].join(" ")}
              >
                <FiFilter className="h-4 w-4" />
              </button>
              {filterOpen ? (
                <div className="absolute left-0 right-0 z-20 mt-2 w-full min-w-[11rem] max-w-[16rem] rounded-2xl border border-zinc-100 bg-white p-2 shadow-lg sm:left-auto sm:right-0">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400">
                    Account type
                  </p>
                  {(["all", "retail", "corporate"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setAccountFilter(f);
                        setFilterOpen(false);
                      }}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-sm capitalize",
                        accountFilter === f
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-700 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      {f === "all" ? "All accounts" : f}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Download CSV"
              onClick={handleDownload}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm hover:text-zinc-800"
            >
              <FiDownload className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Share dashboard"
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm hover:text-zinc-800"
            >
              <FiShare2 className="h-4 w-4" />
            </button>
            {shareMsg ? (
              <span className="text-xs text-zinc-500">{shareMsg}</span>
            ) : null}
            <DashboardTimeframePicker
              value={timeframe}
              onChange={setTimeframe}
            />
            <button
              type="button"
              onClick={() => onRefresh?.()}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs text-zinc-500 shadow-sm hover:text-zinc-800 disabled:opacity-50"
              title="Refresh live data"
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  refreshing ? "animate-pulse bg-amber-400" : "bg-emerald-500",
                ].join(" ")}
              />
              {refreshing
                ? "Updating…"
                : updatedAt
                  ? `Live · ${formatUpdated(updatedAt)}`
                  : "Live"}
            </button>
            <SyncNowButton
              onSynced={() => {
                notifyDashboardRefresh();
                router.refresh();
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {showHero ? (
            <section className="dash-card min-w-0 p-4 sm:p-6 xl:col-span-5">
              <p className="text-sm text-zinc-500">Active clients</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
                  {metrics.activeClients.toLocaleString()}
                </span>
                {metrics.growth ? (
                  <Pill tone={metrics.growth.direction}>
                    {metrics.growth.direction === "up" ? "+" : "-"}
                    {metrics.growth.value}%
                  </Pill>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                {metrics.feedbackInPeriod} feedback · {metrics.messagesInPeriod}{" "}
                messages ({timeframeShort})
              </p>
              <div className="mt-6 flex h-28 items-end justify-between gap-1.5 pt-4">
                {metrics.bars.map((h, i) => (
                  <div
                    key={i}
                    className="w-full max-w-[14px] rounded-t-lg bg-zinc-900/90"
                    style={{ height: `${Math.max(h, 8)}%` }}
                    title={`${h}%`}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div
            className={`grid gap-4 sm:grid-cols-3 ${showHero ? "xl:col-span-7" : "xl:col-span-12"}`}
          >
            {showHero ? (
              <div className="dash-card-sm p-4">
                <p className="text-xs text-zinc-500">Top segment</p>
                <p className="mt-2 font-semibold text-zinc-900">{metrics.segment.label}</p>
                <Pill tone="accent">
                  {metrics.segment.count}{" "}
                  {metrics.segment.count === 1 ? "client" : "clients"}
                </Pill>
              </div>
            ) : null}
            {showLoyalty ? (
              <Link
                href="/loyalty"
                className="dash-card-sm bg-zinc-900 p-4 text-white transition hover:opacity-95"
              >
                <p className="text-xs text-zinc-400">Loyalty accounts</p>
                <p className="mt-2 text-2xl font-bold">
                  {metrics.loyaltyMembers.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {metrics.loyaltyPointsOut.toLocaleString()} pts · View tiers →
                </p>
              </Link>
            ) : null}
            {showMessages ? (
              <div className="dash-card-sm p-4">
                <p className="text-xs text-zinc-500">Win rate</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">
                  {metrics.win !== null ? `${metrics.win}%` : "—"}
                </p>
                {metrics.winDelta && metrics.win !== null ? (
                  <Pill tone={metrics.winDelta.direction}>
                    {metrics.winDelta.direction === "up" ? "+" : "-"}
                    {metrics.winDelta.value}%
                  </Pill>
                ) : (
                  <p className="mt-1 text-xs text-zinc-400">From message delivery</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 xl:col-span-12">
            <button
              type="button"
              className={pillClass("deals")}
              onClick={() =>
                setMetricFilter((m) => (m === "deals" ? "all" : "deals"))
              }
            >
              Deals <strong className="ml-1">{metrics.dealsCount}</strong>
            </button>
            <button
              type="button"
              className={pillClass("loyalty")}
              onClick={() =>
                setMetricFilter((m) => (m === "loyalty" ? "all" : "loyalty"))
              }
            >
              Loyalty <strong className="ml-1">{metrics.loyaltyMembers}</strong>
            </button>
            <button
              type="button"
              className={pillClass("messages")}
              onClick={() =>
                setMetricFilter((m) => (m === "messages" ? "all" : "messages"))
              }
            >
              Messages <strong className="ml-1">{metrics.messagesInPeriod}</strong>
            </button>
            <button
              type="button"
              className={pillClass("feedback")}
              onClick={() =>
                setMetricFilter((m) => (m === "feedback" ? "all" : "feedback"))
              }
            >
              Feedback <strong className="ml-1">{metrics.feedbackInPeriod}</strong>
            </button>
          </div>

          {showMessages ? (
            <section className="dash-card min-w-0 p-4 sm:p-5 xl:col-span-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Engagement</h2>
                <Pill tone="neutral" title={timeframeLabel}>
                  {timeframeShort}
                </Pill>
              </div>
              <div className="mt-4 flex h-32 items-end justify-between gap-2">
                {metrics.weekdays.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full max-w-[28px] rounded-t-lg bg-[var(--dash-accent)]/80"
                      style={{ height: `${Math.max(d.height, 6)}%` }}
                      title={`${d.count} events`}
                    />
                    <span className="text-[10px] text-zinc-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {showFeedbackBlock ? (
            <section className="dash-card min-w-0 overflow-hidden p-0 xl:col-span-4">
              <div className="grid min-h-[200px] grid-cols-1 sm:grid-cols-[minmax(7rem,100px)_1fr]">
                <div className="flex flex-col justify-center bg-[var(--dash-accent)] p-4 text-white">
                  <p className="text-[10px] uppercase tracking-wide opacity-80">
                    QR funnel
                  </p>
                  <p className="mt-2 text-2xl font-bold leading-tight">
                    {metrics.feedbackInPeriod}
                  </p>
                  <p className="text-xs opacity-90">
                    in {timeframeShort} · {metrics.allFeedback} total
                  </p>
                </div>
                <div className="flex flex-col justify-center p-4">
                  <p className="text-sm font-medium text-zinc-800">Landing scans</p>
                  <p className="mt-1 text-xs text-zinc-500">Sync to CRM anytime</p>
                  <Link
                    href="/qr"
                    target="_blank"
                    className="mt-3 text-sm font-medium text-[var(--dash-accent)]"
                  >
                    Open landing →
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          <div className="xl:col-span-12">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {metrics.channels.map((ch) => (
                  <Link
                    key={ch.label}
                    href="/communications"
                    className="dash-card-sm flex min-w-[88px] shrink-0 flex-col justify-center px-3 py-2.5 transition hover:shadow-md"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {ch.label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                      {ch.pct}%
                    </p>
                  </Link>
                ))}

                {metrics.recentClients.length ? (
                  metrics.recentClients.map((c) => (
                    <Link
                      key={c.id}
                      href={`/contacts/${c.id}`}
                      className="dash-card-sm flex min-w-[128px] shrink-0 flex-col justify-center px-3 py-2.5 transition hover:shadow-md"
                    >
                      <p className="truncate text-xs font-medium text-zinc-900">
                        {c.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                        {c.email}
                      </p>
                      <p className="mt-1 text-[10px] capitalize text-zinc-400">
                        {c.account_type}
                      </p>
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/acquisition/qr"
                    className="dash-card-sm flex min-w-[160px] shrink-0 items-center px-3 py-2.5"
                  >
                    <p className="text-[11px] leading-snug text-zinc-500">
                      No clients — open QR hub
                    </p>
                  </Link>
                )}

                <Link
                  href="/contacts"
                  className="dash-card-sm flex min-w-[72px] shrink-0 items-center justify-center px-3 py-2.5 text-[11px] font-medium text-[var(--dash-accent)]"
                >
                  All →
                </Link>

                {[
                  { label: "Contacts", href: "/contacts" },
                  { label: "Feedback", href: "/feedback" },
                  { label: "QR hub", href: "/acquisition/qr" },
                  { label: "Sync", href: "/acquisition/sync" },
                  { label: "Pipeline", href: "/pipeline" },
                  { label: "Loyalty", href: "/loyalty" },
                ].map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="dash-card-sm flex min-w-[80px] shrink-0 items-center justify-center px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>

          {showFeedbackBlock ? (
            <div className="min-w-0 xl:col-span-12">
              <QrLandingPanel />
            </div>
          ) : null}
        </div>
        </div>
      </main>
    </div>
  );
}
