import Link from "next/link";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { getNavItemByHref } from "@/config/crm-navigation";
import { channelStats } from "@/lib/engagement-stats";
import { getCommunicationLogsFiltered } from "@/lib/api";

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string }>;
}) {
  const { status, channel } = await searchParams;
  const nav = getNavItemByHref("/communications");
  const logs = await getCommunicationLogsFiltered({ status, channel });
  const list = logs?.data ?? [];
  const stats = channelStats(list);

  return (
    <CrmPageShell
      item={nav}
      headerActions={
        <Link
          href="/campaigns"
          className="rounded-lg bg-[var(--dash-accent)] px-3 py-2 text-sm font-medium text-white"
        >
          Campaigns
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        {stats.map((s) => (
          <span key={s.channel} className="dash-pill bg-white text-zinc-700 shadow-sm">
            {s.channel}{" "}
            <strong className="ml-1">
              {s.total} · {s.rate}%
            </strong>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "email", "sms", "whatsapp"].map((ch) => (
          <Link
            key={ch || "all-ch"}
            href={ch ? `/communications?channel=${ch}` : "/communications"}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium",
              (channel ?? "") === ch
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200",
            ].join(" ")}
          >
            {ch || "All channels"}
          </Link>
        ))}
        {["", "queued", "sent", "delivered", "failed"].map((st) => (
          <Link
            key={st || "all-st"}
            href={
              st
                ? `/communications?status=${st}${channel ? `&channel=${channel}` : ""}`
                : "/communications"
            }
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium",
              (status ?? "") === st
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200",
            ].join(" ")}
          >
            {st || "All statuses"}
          </Link>
        ))}
      </div>

      <section className="dash-card min-w-0 overflow-hidden">
        <div className="border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:px-5">
          Message log ({list.length})
        </div>
        <div className="divide-y divide-zinc-100">
          {list.map((log) => (
            <article key={log.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-sm font-medium capitalize text-zinc-900">
                    {log.channel}
                  </span>
                  <StatusBadge status={log.status} />
                  {log.client ? (
                    <Link
                      href={
                        log.client.account_type === "corporate"
                          ? `/companies/${log.client.id}`
                          : `/contacts/${log.client.id}`
                      }
                      className="truncate text-sm text-[var(--dash-accent)] hover:underline"
                    >
                      {log.client.company_name ?? log.client.name}
                    </Link>
                  ) : null}
                </div>
                <time className="text-xs text-zinc-500">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                </time>
              </div>
              <p className="mt-1 break-all text-xs text-zinc-500">
                {log.recipient_address}
              </p>
              <p className="mt-2 break-words text-sm text-zinc-700">{log.message_body}</p>
            </article>
          ))}
          {!list.length && (
            <p className="px-5 py-10 text-center text-sm text-zinc-600">
              No messages yet. Launch a{" "}
              <Link href="/campaigns" className="font-medium underline">
                campaign
              </Link>{" "}
              or log from a contact profile.
            </p>
          )}
        </div>
      </section>
    </CrmPageShell>
  );
}
