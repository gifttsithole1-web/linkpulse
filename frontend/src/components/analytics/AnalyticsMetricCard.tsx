"use client";

import type { PeriodMetric } from "@/lib/analytics-period";

function GrowthPill({
  growth,
}: {
  growth: NonNullable<PeriodMetric["growth"]> | null;
}) {
  if (!growth) return null;
  const tone =
    growth.direction === "up"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-600";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {growth.direction === "up" ? "+" : "-"}
      {growth.value}%
    </span>
  );
}

function ActivitySparkline({ heights }: { heights: number[] }) {
  return (
    <div className="mt-6 flex h-24 items-end justify-between gap-1.5 pt-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-full max-w-[14px] flex-1 rounded-t-lg bg-zinc-900/90"
          style={{ height: `${Math.max(h, 8)}%` }}
          title={`${h}% activity`}
        />
      ))}
    </div>
  );
}

export function AnalyticsMetricCard({
  label,
  metric,
  featured,
}: {
  label: string;
  metric: PeriodMetric;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "dash-card flex min-w-0 flex-col p-4 sm:p-5",
        featured ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <span className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          {metric.value.toLocaleString()}
        </span>
        <GrowthPill growth={metric.growth} />
      </div>
      <p className="mt-3 text-sm text-zinc-500">{metric.sub}</p>
      <ActivitySparkline heights={metric.sparkline} />
    </article>
  );
}
