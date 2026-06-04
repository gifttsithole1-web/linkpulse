import Link from "next/link";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { LoyaltyEnrollButton } from "@/components/loyalty/LoyaltyEnrollButton";
import {
  AwardPointsForm,
  ClientEditProfileForm,
  DeleteClientButton,
  EditContextForm,
  SendMessageForm,
} from "@/components/contacts/ClientForms";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { whatsAppHref } from "@/lib/zimbabwe-phone";
import { JsonBlock } from "@/components/contacts/JsonBlock";
import type { ClientDetail, CommunicationLogDetail } from "@/lib/api";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg font-semibold text-white sm:h-14 sm:w-14">
      {initials || "C"}
    </div>
  );
}

function TypePill({ type }: { type: "retail" | "corporate" }) {
  const cls =
    type === "corporate"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-emerald-50 text-emerald-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {type}
    </span>
  );
}

function StatusPill({ status }: { status: CommunicationLogDetail["status"] }) {
  const tones: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-700",
    sent: "bg-blue-50 text-blue-700",
    queued: "bg-amber-50 text-amber-700",
    pending: "bg-zinc-100 text-zinc-600",
    failed: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${tones[status] ?? tones.pending}`}
    >
      {status}
    </span>
  );
}

type Client360Props = {
  client: ClientDetail;
  backHref?: string;
  backLabel?: string;
};

export function Client360({
  client,
  backHref = "/contacts",
  backLabel = "← Contacts",
}: Client360Props) {
  const loyalty = client.loyalty_account;
  const logs = client.communication_logs ?? [];
  const feedback = client.feedback_submissions ?? [];
  const isRetail = client.account_type === "retail";
  const stageLabel =
    PIPELINE_STAGES.find((s) => s.id === (client.pipeline_stage ?? "lead"))
      ?.label ?? "Lead";

  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <Avatar name={client.name} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-accent)]">
                {client.account_type === "corporate" ? "Company 360" : "Client 360"}
              </p>
              <h1 className="break-words text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                {client.account_type === "corporate" && client.company_name
                  ? client.company_name
                  : client.name}
              </h1>
              {client.account_type === "corporate" ? (
                <p className="text-sm text-zinc-500">Primary contact: {client.name}</p>
              ) : client.company_name ? (
                <p className="text-sm text-zinc-500">{client.company_name}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TypePill type={client.account_type} />
                {client.marketing_opt_in ? (
                  <span className="text-xs text-zinc-500">Marketing opt-in</span>
                ) : null}
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {stageLabel}
                </span>
                {client.source ? (
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    via {client.source}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-start gap-2">
            <a
              href={`tel:${client.phone_number}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Call
            </a>
            <a
              href={`mailto:${client.email}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Email
            </a>
            {client.whatsapp_number ? (
              <a
                href={whatsAppHref(client.whatsapp_number)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"
              >
                WhatsApp
              </a>
            ) : null}
            <Link
              href={backHref}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              {backLabel}
            </Link>
            <DeleteClientButton client={client} backHref={backHref} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="dash-card min-w-0 space-y-3 p-4 sm:p-5 lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold text-zinc-900">Profile</h2>
              <ClientEditProfileForm client={client} />
            </div>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-zinc-400">Email</dt>
                <dd className="break-all font-medium text-zinc-900">{client.email}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-zinc-400">Phone</dt>
                <dd className="font-medium text-zinc-900">{client.phone_number}</dd>
              </div>
              {client.whatsapp_number ? (
                <div className="min-w-0">
                  <dt className="text-zinc-400">WhatsApp</dt>
                  <dd className="font-medium text-zinc-900">
                    {client.whatsapp_number}
                  </dd>
                </div>
              ) : null}
              {client.created_at ? (
                <div>
                  <dt className="text-zinc-400">Joined</dt>
                  <dd className="text-zinc-800">
                    {new Date(client.created_at).toLocaleDateString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="dash-card min-w-0 p-4 sm:p-5">
            <h2 className="font-semibold text-zinc-900">Loyalty</h2>
            {loyalty ? (
              <>
                <p className="mt-3 text-3xl font-bold text-zinc-900">
                  {loyalty.points_balance.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-zinc-500">pts</span>
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Tier <strong>{loyalty.tier_level}</strong> · Lifetime{" "}
                  {loyalty.lifetime_points.toLocaleString()}
                </p>
                <AwardPointsForm clientId={client.id} />
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-zinc-500">Not on the loyalty ledger.</p>
                <LoyaltyEnrollButton clientId={client.id} />
              </>
            )}
          </section>
        </div>

        <section className="dash-card min-w-0 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-zinc-900">
              {isRetail ? "Brand specs" : "IT infrastructure"}
            </h2>
            <EditContextForm client={client} />
          </div>
          <div className="mt-4">
            <JsonBlock
              data={isRetail ? client.brand_specs : client.it_infrastructure}
              emptyLabel={
                isRetail
                  ? "No brand specs yet. Click edit to add colors, logos, margins…"
                  : "No IT profile yet. Click edit to add stack, domains, support tier…"
              }
            />
          </div>
        </section>

        <section className="dash-card min-w-0 p-4 sm:p-5">
          <h2 className="font-semibold text-zinc-900">Message timeline</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {logs.length} message{logs.length === 1 ? "" : "s"} logged
          </p>
          <SendMessageForm clientId={client.id} client={client} />
          <ul className="mt-6 divide-y divide-zinc-100">
            {logs.map((log) => (
              <li key={log.id} className="flex gap-3 py-4 first:pt-0 sm:gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-[10px] font-bold uppercase text-zinc-600">
                  {log.channel.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium capitalize text-zinc-900">
                      {log.channel}
                    </span>
                    <StatusPill status={log.status} />
                    <span className="text-xs text-zinc-400">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-xs text-zinc-500">
                    {log.recipient_address}
                  </p>
                  <p className="mt-2 break-words text-sm text-zinc-700">
                    {log.message_body}
                  </p>
                </div>
              </li>
            ))}
            {!logs.length ? (
              <li className="py-8 text-center text-sm text-zinc-500">
                No messages yet. Log one above.
              </li>
            ) : null}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="dash-card min-w-0 p-4 sm:p-5">
            <h2 className="font-semibold text-zinc-900">Feedback</h2>
            <ul className="mt-4 space-y-3">
              {feedback.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-3"
                >
                  <p className="break-words text-sm text-zinc-800">{row.feedback}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "—"}{" "}
                    · {row.source}
                  </p>
                </li>
              ))}
              {!feedback.length ? (
                <p className="text-sm text-zinc-500">No feedback linked to this client.</p>
              ) : null}
            </ul>
          </section>

          <section className="dash-card min-w-0 p-4 sm:p-5">
            <h2 className="font-semibold text-zinc-900">Work orders & approvals</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Quotes, proofing jobs, and sign-offs will appear here when the work-order
              API is connected.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/work-orders"
                className="text-sm font-medium text-[var(--dash-accent)]"
              >
                Work orders →
              </Link>
              <Link
                href="/proofing"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Proofing →
              </Link>
            </div>
          </section>
        </div>
      </AppPageBody>
    </AppPage>
  );
}
