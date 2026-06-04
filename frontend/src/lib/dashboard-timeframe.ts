/** @deprecated Use PresetDays */
export type TimeframeDays = 7 | 30 | 90;
export type PresetDays = TimeframeDays;

export type DashboardTimeframe =
  | { kind: "preset"; days: PresetDays }
  | { kind: "custom"; start: string; end: string };

export const DEFAULT_TIMEFRAME: DashboardTimeframe = { kind: "preset", days: 90 };

export function defaultCustomRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function getTimeframeBounds(tf: DashboardTimeframe): { start: Date; end: Date } {
  const now = new Date();
  if (tf.kind === "preset") {
    const start = new Date(now);
    start.setDate(start.getDate() - tf.days);
    return { start, end: now };
  }
  const start = new Date(tf.start);
  const end = new Date(tf.end);
  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function getPriorPeriodBounds(tf: DashboardTimeframe): {
  start: Date;
  end: Date;
} {
  const { start, end } = getTimeframeBounds(tf);
  const durationMs = Math.max(end.getTime() - start.getTime(), 60_000);
  return {
    start: new Date(start.getTime() - durationMs),
    end: new Date(start.getTime()),
  };
}

export function timeframeDurationMs(tf: DashboardTimeframe): number {
  const { start, end } = getTimeframeBounds(tf);
  return Math.max(end.getTime() - start.getTime(), 60_000);
}

export function timeframeDurationDays(tf: DashboardTimeframe): number {
  return Math.max(1, Math.ceil(timeframeDurationMs(tf) / 86_400_000));
}

export function isInTimeframe(
  iso: string | undefined,
  tf: DashboardTimeframe,
): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const { start, end } = getTimeframeBounds(tf);
  return d >= start && d <= end;
}

export function formatTimeframeLabel(tf: DashboardTimeframe): string {
  if (tf.kind === "preset") return `Last ${tf.days} days`;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(tf.start)} – ${fmt(tf.end)}`;
}

export function formatTimeframeShort(tf: DashboardTimeframe): string {
  if (tf.kind === "preset") return `${tf.days}d`;
  return `${timeframeDurationDays(tf)}d`;
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
