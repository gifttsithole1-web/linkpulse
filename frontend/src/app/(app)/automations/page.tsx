import Link from "next/link";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { getNavItemByHref } from "@/config/crm-navigation";

const RULES = [
  {
    id: "qr-sync",
    name: "QR → CRM sync",
    description: "Firestore submissions become clients + feedback.",
    status: "active",
    href: "/acquisition/sync",
  },
  {
    id: "cascade",
    name: "48h message cascade",
    description: "Email → SMS → WhatsApp retry for failed sends.",
    status: "planned",
    href: "/communications",
  },
];

export default async function AutomationsPage() {
  const nav = getNavItemByHref("/automations");

  return (
    <CrmPageShell item={nav}>
      <section className="dash-card min-w-0 divide-y divide-zinc-100">
        {RULES.map((rule) => (
          <div
            key={rule.id}
            className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="font-medium text-zinc-900">{rule.name}</p>
              <p className="text-sm text-zinc-600">{rule.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge
                status={rule.status === "active" ? "active" : "pending"}
              />
              {rule.href ? (
                <Link
                  href={rule.href}
                  className="text-sm font-medium text-[var(--dash-accent)]"
                >
                  Open →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </CrmPageShell>
  );
}
