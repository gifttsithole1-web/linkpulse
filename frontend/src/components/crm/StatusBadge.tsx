export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const tones: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sent: "bg-blue-50 text-blue-700 border-blue-100",
    queued: "bg-amber-50 text-amber-700 border-amber-100",
    pending: "bg-zinc-50 text-zinc-600 border-zinc-200",
    failed: "bg-rose-50 text-rose-600 border-rose-100",
    active: "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] border-transparent",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${tones[status] ?? tones.pending}`}
    >
      {status}
    </span>
  );
}
