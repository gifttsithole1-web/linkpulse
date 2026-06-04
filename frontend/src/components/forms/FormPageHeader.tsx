import Link from "next/link";

export function FormPageHeader({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
        {title}
      </h1>
      <Link
        href={backHref}
        className="shrink-0 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
      >
        {backLabel}
      </Link>
    </div>
  );
}
