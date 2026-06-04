import Link from "next/link";
import { LoyaltyAddMember } from "@/components/loyalty/LoyaltyAddMember";
import { LoyaltyAwardForm } from "@/components/loyalty/LoyaltyAwardForm";
import { LoyaltyRemoveMember } from "@/components/loyalty/LoyaltyRemoveMember";
import type { Client, LoyaltyAccount } from "@/lib/api";

export function LoyaltyMemberManager({
  members,
  eligible,
  defaultMargin = 0.1,
  showAwardForms = true,
  compact = false,
}: {
  members: LoyaltyAccount[];
  eligible: Pick<Client, "id" | "name" | "email" | "account_type">[];
  defaultMargin?: number;
  showAwardForms?: boolean;
  compact?: boolean;
}) {
  return (
    <section className="dash-card min-w-0 overflow-hidden">
      <div className="border-b border-zinc-100 px-4 py-3 sm:px-5">
        <h2 className="font-semibold text-zinc-900">Loyalty members</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add or remove contacts on the loyalty list. Award points on the{" "}
          <Link href="/loyalty" className="text-zinc-700 underline-offset-2 hover:underline">
            ledger
          </Link>
          .
        </p>
        <div className="mt-4">
          <LoyaltyAddMember eligible={eligible} />
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {members.map((row) => {
          const clientId = row.client?.id ?? row.client_id;
          const profileHref =
            row.client?.account_type === "corporate"
              ? `/companies/${clientId}`
              : `/contacts/${clientId}`;
          return (
            <div
              key={row.id}
              className={[
                "flex flex-col gap-3 px-4 py-4 sm:px-5",
                compact ? "" : "lg:flex-row lg:items-center lg:justify-between",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={profileHref}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {row.client?.name}
                    </Link>
                    <p className="truncate text-sm text-zinc-500">{row.client?.email}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Tier {row.tier_level} · {row.points_balance.toLocaleString()} pts
                    </p>
                  </div>
                  <LoyaltyRemoveMember
                    clientId={String(clientId)}
                    clientName={row.client?.name ?? "Member"}
                  />
                </div>
              </div>
              {showAwardForms && !compact ? (
                <LoyaltyAwardForm
                  clientId={String(clientId)}
                  defaultMargin={defaultMargin}
                />
              ) : null}
            </div>
          );
        })}
        {!members.length && (
          <p className="px-5 py-8 text-center text-sm text-zinc-600">
            No one on the list yet. Choose a contact above, then award points on the
            ledger.
          </p>
        )}
      </div>
    </section>
  );
}
