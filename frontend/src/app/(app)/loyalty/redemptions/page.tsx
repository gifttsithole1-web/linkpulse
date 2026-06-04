import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { LoyaltyMemberManager } from "@/components/loyalty/LoyaltyMemberManager";
import { RedeemForm } from "@/components/loyalty/RedeemForm";
import { getNavItemByHref } from "@/config/crm-navigation";
import { getClients, getLoyaltyAccounts } from "@/lib/api";

const CATALOG = [
  { label: "1hr diagnostics", points: 500, desc: "Remote or on-site triage" },
  { label: "2hr support block", points: 900, desc: "Priority technician time" },
  { label: "Print credit $50", points: 1200, desc: "Applies to next print job" },
  { label: "Brand audit", points: 2000, desc: "Logo, colours, and specs review" },
];

export default async function RedemptionsPage() {
  const nav = getNavItemByHref("/loyalty/redemptions");
  const [accounts, clients] = await Promise.all([
    getLoyaltyAccounts(),
    getClients({ per_page: 500 }),
  ]);
  const list = accounts?.data ?? [];
  const eligible = (clients?.data ?? []).filter((c) => !c.loyalty_account);

  return (
    <CrmPageShell
      item={nav}
      backHref="/loyalty"
      backLabel="← Loyalty ledger"
    >
      <LoyaltyMemberManager
        members={list}
        eligible={eligible}
        showAwardForms={false}
        compact
      />

      <div
        className={
          list.length
            ? "grid grid-cols-1 gap-6 lg:grid-cols-2"
            : "max-w-xl"
        }
      >
        <section className="dash-card min-w-0 p-4 sm:p-5">
          <h2 className="font-semibold text-zinc-900">Rewards catalog</h2>
          <ul className="mt-4 space-y-3">
            {CATALOG.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[var(--dash-accent)]">
                  {item.points} pts
                </span>
              </li>
            ))}
          </ul>
        </section>
        <RedeemForm accounts={list} />
      </div>
    </CrmPageShell>
  );
}
