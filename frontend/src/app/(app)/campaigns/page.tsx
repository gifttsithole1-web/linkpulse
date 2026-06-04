import Link from "next/link";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { CampaignLauncher } from "@/components/engagement/CampaignLauncher";
import { getNavItemByHref } from "@/config/crm-navigation";
import { groupCampaigns } from "@/lib/engagement-stats";
import { getCommunicationLogs } from "@/lib/api";

export default async function CampaignsPage() {
  const nav = getNavItemByHref("/campaigns");
  const logs = await getCommunicationLogs();
  const campaigns = groupCampaigns(logs?.data ?? []);

  return (
    <CrmPageShell
      item={nav}
      headerActions={
        <Link
          href="/communications"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
        >
          View logs
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CampaignLauncher />
        <section className="dash-card min-w-0 p-4 sm:p-5">
          <h2 className="font-semibold text-zinc-900">Recent campaigns</h2>
          <ul className="mt-4 divide-y divide-zinc-100">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-500">
                    {c.count} messages · {new Date(c.latest).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-medium capitalize text-zinc-500">
                  {c.channel}
                </span>
              </li>
            ))}
            {!campaigns.length && (
              <li className="py-8 text-sm text-zinc-600">
                No campaigns yet. Launch one to queue messages for your audience.
              </li>
            )}
          </ul>
        </section>
      </div>
    </CrmPageShell>
  );
}
