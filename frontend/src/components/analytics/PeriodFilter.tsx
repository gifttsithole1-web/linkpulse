"use client";

import { ANALYTICS_PERIODS, type AnalyticsPeriod } from "@/lib/analytics-period";

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function PeriodFilter({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-2xl border border-zinc-200/90 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Analytics period"
    >
      {ANALYTICS_PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          role="tab"
          aria-selected={value === period}
          onClick={() => onChange(period)}
          className={[
            "rounded-xl px-3 py-2 text-sm font-medium capitalize transition",
            value === period
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-50",
          ].join(" ")}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  );
}
