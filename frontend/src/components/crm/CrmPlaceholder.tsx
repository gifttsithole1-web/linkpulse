import Link from "next/link";

export function CrmPlaceholder({
  title,
  summary,
  features,
  primaryHref,
  primaryLabel = "Back to dashboard",
}: {
  title: string;
  summary: string;
  features: string[];
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="dash-card max-w-3xl p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-accent)]">
        Coming soon
      </p>
      <h2 className="mt-2 text-xl font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{summary}</p>
      <ul className="mt-6 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-zinc-700">
            <span className="text-[var(--dash-accent)]">•</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={primaryHref ?? "/dashboard"}
        className="mt-8 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
      >
        {primaryLabel}
      </Link>
    </div>
  );
}
