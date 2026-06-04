"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import {
  DEFAULT_TIMEFRAME,
  defaultCustomRange,
  formatTimeframeLabel,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type DashboardTimeframe,
  type PresetDays,
} from "@/lib/dashboard-timeframe";

type SelectValue = "7" | "30" | "90" | "custom";

function selectValueFromTimeframe(tf: DashboardTimeframe): SelectValue {
  if (tf.kind === "custom") return "custom";
  return String(tf.days) as SelectValue;
}

export function DashboardTimeframePicker({
  value,
  onChange,
}: {
  value: DashboardTimeframe;
  onChange: (tf: DashboardTimeframe) => void;
}) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectValue, setSelectValue] = useState<SelectValue>(() =>
    selectValueFromTimeframe(value),
  );
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectValue(selectValueFromTimeframe(value));
    if (value.kind === "custom") {
      setDraftStart(toDatetimeLocalValue(value.start));
      setDraftEnd(toDatetimeLocalValue(value.end));
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function openCustomPanel(range?: { start: string; end: string }) {
    const r =
      range ??
      (value.kind === "custom" ? { start: value.start, end: value.end } : defaultCustomRange());
    setDraftStart(toDatetimeLocalValue(r.start));
    setDraftEnd(toDatetimeLocalValue(r.end));
    setError(null);
    setOpen(true);
  }

  function handleSelectChange(next: SelectValue) {
    setSelectValue(next);
    setError(null);
    if (next === "custom") {
      openCustomPanel();
      return;
    }
    setOpen(false);
    onChange({ kind: "preset", days: Number(next) as PresetDays });
  }

  function applyCustom() {
    if (!draftStart || !draftEnd) {
      setError("Choose both start and end.");
      return;
    }
    const start = new Date(fromDatetimeLocalValue(draftStart));
    const end = new Date(fromDatetimeLocalValue(draftEnd));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Invalid date or time.");
      return;
    }
    if (start.getTime() >= end.getTime()) {
      setError("End must be after start.");
      return;
    }
    const tf: DashboardTimeframe = {
      kind: "custom",
      start: start.toISOString(),
      end: end.toISOString(),
    };
    onChange(tf);
    setSelectValue("custom");
    setOpen(false);
    setError(null);
  }

  const displayLabel =
    value.kind === "custom"
      ? "Custom range"
      : `Last ${value.days} days`;

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm shadow-sm sm:rounded-[20px] sm:px-4 sm:py-2.5">
        <label htmlFor={`${panelId}-preset`} className="shrink-0 text-zinc-500">
          Timeframe
        </label>
        <select
          id={`${panelId}-preset`}
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value as SelectValue)}
          className="min-w-0 max-w-full font-medium text-zinc-800 outline-none"
          aria-expanded={open}
          aria-controls={open ? `${panelId}-panel` : undefined}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value="custom">Custom range…</option>
        </select>
        <button
          type="button"
          aria-label="Pick custom date and time"
          aria-expanded={open}
          aria-controls={`${panelId}-panel`}
          onClick={() => {
            setSelectValue("custom");
            openCustomPanel();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-700"
          title={displayLabel}
        >
          <FiCalendar className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div
          id={`${panelId}-panel`}
          role="dialog"
          aria-label="Custom date and time range"
          className="absolute right-0 z-30 mt-2 w-[min(100vw-1.5rem,22rem)] rounded-2xl border border-zinc-100 bg-white p-4 shadow-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Custom range
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Filter messages, feedback, and period metrics between these times.
          </p>
          <div className="mt-3 space-y-3">
            <label className="block text-xs text-zinc-500">
              Start
              <input
                type="datetime-local"
                value={draftStart}
                onChange={(e) => setDraftStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[var(--dash-accent)]"
              />
            </label>
            <label className="block text-xs text-zinc-500">
              End
              <input
                type="datetime-local"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[var(--dash-accent)]"
              />
            </label>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-rose-600">{error}</p>
          ) : null}
          {value.kind === "custom" ? (
            <p className="mt-2 text-[11px] text-zinc-400">
              Active: {formatTimeframeLabel(value)}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyCustom}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
                if (value.kind === "preset") {
                  setSelectValue(String(value.days) as SelectValue);
                }
              }}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(DEFAULT_TIMEFRAME);
                setSelectValue("90");
                setOpen(false);
              }}
              className="ml-auto text-xs text-zinc-400 hover:text-zinc-600"
            >
              Reset to 90d
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
