import Link from "next/link";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { LoyaltyMemberManager } from "@/components/loyalty/LoyaltyMemberManager";
import { getNavItemByHref } from "@/config/crm-navigation";
import { getClients, getLoyaltyAccounts, getSettings } from "@/lib/api";

export default async function LoyaltyPage() {
  const nav = getNavItemByHref("/loyalty");
  const [accounts, clients, settings] = await Promise.all([
    getLoyaltyAccounts(),
    getClients({ per_page: 500 }),
    getSettings(),
  ]);
  const list = accounts?.data ?? [];
  const allClients = clients?.data ?? [];
  const eligible = allClients.filter((c) => !c.loyalty_account);
  const margin = settings?.default_margin_coefficient ?? 0.1;
  const totalPoints = list.reduce((s, a) => s + a.points_balance, 0);

  return (
    <CrmPageShell
      item={nav}
      headerActions={
        <Link
          href="/loyalty/redemptions"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Redemptions
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="dash-pill bg-white text-zinc-700 shadow-sm">
          On list <strong className="ml-1">{list.length}</strong>
        </span>
        <span className="dash-pill bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
          Points out <strong className="ml-1">{totalPoints.toLocaleString()}</strong>
        </span>
        <span className="dash-pill bg-white text-zinc-700 shadow-sm">
          Default margin <strong className="ml-1">{margin}</strong>
        </span>
      </div>

      <LoyaltyMemberManager
        members={list}
        eligible={eligible}
        defaultMargin={margin}
        showAwardForms
      />
    </CrmPageShell>
  );
}
