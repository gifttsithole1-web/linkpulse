import Link from "next/link";
import type { NavItem } from "@/config/crm-navigation";

export function CrmPageHeader({
  item,
  backHref = "/dashboard",
  backLabel = "← Dashboard",
  actions,
}: {
  item: Pick<NavItem, "label" | "description">;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-zinc-200/80 pb-4 sm:gap-4 sm:pb-5 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {item.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
        {actions}
        <Link
          href={backHref}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          {backLabel}
        </Link>
      </div>
    </section>
  );
}
