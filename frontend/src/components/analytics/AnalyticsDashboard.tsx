"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { AnalyticsMetricCard } from "@/components/analytics/AnalyticsMetricCard";
import { PeriodFilter } from "@/components/analytics/PeriodFilter";
import type {
  Client,
  CommunicationLog,
  FeedbackSubmission,
  LoyaltyAccount,
} from "@/lib/api";
import {
  buildPeriodSnapshot,
  PERIOD_CONFIG,
  type AnalyticsPeriod,
} from "@/lib/analytics-period";
import {
  analyticsToCsv,
  buildAnalyticsReport,
  type AnalyticsReport,
} from "@/lib/crm-analytics";
import { PIPELINE_STAGES } from "@/lib/pipeline";

function BarRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-600">
        <span className="capitalize">{label}</span>
        <span>
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[var(--dash-accent)]"
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

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

export function AnalyticsDashboard({
  clients,
  logs,
  feedback,
  loyalty,
  updatedAt,
  refreshing,
  onRefresh,
}: {
  clients: Client[];
  logs: CommunicationLog[];
  feedback: FeedbackSubmission[];
  loyalty: LoyaltyAccount[];
  updatedAt?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("monthly");

  const snapshot = useMemo(
    () => buildPeriodSnapshot(clients, logs, feedback, period),
    [clients, logs, feedback, period],
  );

  const report: AnalyticsReport = useMemo(
    () => buildAnalyticsReport(clients, logs, feedback, loyalty),
    [clients, logs, feedback, loyalty],
  );

  const csv = useMemo(() => analyticsToCsv(report, clients), [report, clients]);
  const maxChannel = Math.max(
    ...report.messages.channels.map((c) => c.total),
    1,
  );
  const qrConversion =
    report.feedback.total > 0
      ? Math.round((report.clients.qrSource / report.feedback.total) * 100)
      : null;

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkpulse-analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />
          <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-zinc-200/90 bg-white px-3 py-2 text-sm shadow-sm">
            <FiCalendar className="shrink-0 text-zinc-400" aria-hidden />
            <span className="text-zinc-500">Range</span>
            <span className="font-medium text-zinc-800">
              {PERIOD_CONFIG[period].label}
            </span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 disabled:opacity-50"
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
          ) : null}
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Export CSV
          </button>
          <Link
            href="/pipeline"
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
          >
            View pipeline
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsMetricCard
          label="Active clients"
          metric={snapshot.activeClients}
          featured
        />
        <AnalyticsMetricCard label="New contacts" metric={snapshot.newContacts} />
        <AnalyticsMetricCard label="Messages" metric={snapshot.messages} />
        <AnalyticsMetricCard label="Feedback" metric={snapshot.feedback} />
        <AnalyticsMetricCard
          label="WhatsApp ready"
          metric={snapshot.whatsappReady}
        />
        <AnalyticsMetricCard label="QR leads" metric={snapshot.qrLeads} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dash-card min-w-0 p-4">
          <p className="text-xs text-zinc-500">Retail</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {report.clients.retail}
          </p>
        </div>
        <div className="dash-card min-w-0 p-4">
          <p className="text-xs text-zinc-500">Corporate</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {report.clients.corporate}
          </p>
        </div>
        <div className="dash-card min-w-0 p-4">
          <p className="text-xs text-zinc-500">Marketing opt-in</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {report.clients.marketingOptIn}
          </p>
        </div>
        <div className="dash-card min-w-0 p-4">
          <p className="text-xs text-zinc-500">Loyalty accounts</p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {report.loyalty.accounts}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="dash-card min-w-0 p-4 sm:p-6">
          <h2 className="font-semibold text-zinc-900">Acquisition funnel</h2>
          <p className="mt-1 text-sm text-zinc-500">
            QR scans → CRM clients → feedback inbox
          </p>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-600">Feedback submissions</dt>
              <dd className="text-lg font-bold text-zinc-900">
                {report.feedback.total}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-600">Clients from QR source</dt>
              <dd className="text-lg font-bold text-zinc-900">
                {report.clients.qrSource}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-zinc-600">Marketing opt-in</dt>
              <dd className="text-lg font-bold text-zinc-900">
                {report.clients.marketingOptIn}
              </dd>
            </div>
          </dl>
          {qrConversion !== null ? (
            <p className="mt-4 text-xs text-zinc-500">
              ~{qrConversion}% of feedback rows have a matching QR-sourced client
              (approximate; depends on sync).
            </p>
          ) : null}
          <Link
            href="/acquisition/qr"
            className="mt-4 inline-block text-sm font-medium text-[var(--dash-accent)]"
          >
            QR hub →
          </Link>
        </section>

        <section className="dash-card min-w-0 p-4 sm:p-6">
          <h2 className="font-semibold text-zinc-900">Channel performance</h2>
          <p className="mt-1 text-sm text-zinc-500">
            All-time delivery rate by channel
          </p>
          <div className="mt-6 space-y-4">
            {report.messages.channels.map((ch) => (
              <div key={ch.channel}>
                <BarRow label={ch.channel} value={ch.total} max={maxChannel} />
                <p className="mt-1 text-[11px] text-zinc-400">
                  {ch.delivered} delivered · {ch.rate}% success
                </p>
              </div>
            ))}
            {!report.messages.total ? (
              <p className="text-sm text-zinc-500">
                No messages yet.{" "}
                <Link href="/campaigns" className="font-medium underline">
                  Launch a campaign
                </Link>
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="dash-card min-w-0 p-4 sm:p-6">
          <h2 className="font-semibold text-zinc-900">Loyalty snapshot</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Accounts</dt>
              <dd className="text-xl font-bold text-zinc-900">
                {report.loyalty.accounts}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Points outstanding</dt>
              <dd className="text-xl font-bold text-zinc-900">
                {report.loyalty.totalPoints.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Lifetime earned</dt>
              <dd className="text-xl font-bold text-zinc-900">
                {report.loyalty.totalLifetime.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Common tier</dt>
              <dd className="text-xl font-bold text-zinc-900">
                {report.loyalty.topTier ?? "—"}
              </dd>
            </div>
          </dl>
          <Link
            href="/loyalty"
            className="mt-4 inline-block text-sm font-medium text-[var(--dash-accent)]"
          >
            Loyalty ledger →
          </Link>
        </section>

        <section className="dash-card min-w-0 p-4 sm:p-6">
          <h2 className="font-semibold text-zinc-900">Pipeline distribution</h2>
          <div className="mt-4 space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = report.pipeline[stage.id] ?? 0;
              const max = Math.max(...Object.values(report.pipeline), 1);
              return (
                <BarRow
                  key={stage.id}
                  label={stage.label}
                  value={count}
                  max={max}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
