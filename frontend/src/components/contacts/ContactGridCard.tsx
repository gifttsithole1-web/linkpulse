"use client";

import { useRouter } from "next/navigation";
import { ClientRowMenu } from "@/components/contacts/ClientRowMenu";
import type { Client } from "@/lib/api";
import { whatsAppHref } from "@/lib/zimbabwe-phone";

function TextAction({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-zinc-500 transition hover:text-zinc-900"
    >
      {label}
    </a>
  );
}

export function ContactGridCard({ client }: { client: Client }) {
  const router = useRouter();
  const detailHref =
    client.account_type === "corporate"
      ? `/companies/${client.id}`
      : `/contacts/${client.id}`;

  const subtitle = client.company_name?.trim();
  const wa = client.whatsapp_number;
  const typeLabel =
    client.account_type === "corporate" ? "Corporate" : "Retail";

  function openDetail() {
    router.push(detailHref);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="flex cursor-pointer flex-col rounded-xl border border-zinc-200/80 bg-white p-4 transition hover:border-zinc-300 outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-medium text-zinc-900">
            {client.name}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
          ) : null}
          <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-400">
            {typeLabel}
          </p>
        </div>
        <ClientRowMenu client={client} detailHref={detailHref} />
      </div>

      <div className="mt-4 space-y-1 text-xs text-zinc-500">
        <p className="truncate">{client.email}</p>
        <p className="truncate">{client.phone_number}</p>
        {wa ? <p className="truncate text-zinc-600">{wa}</p> : null}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-3"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <TextAction href={`tel:${client.phone_number}`} label="Call" />
        <TextAction href={`mailto:${client.email}`} label="Mail" />
        {wa ? (
          <TextAction href={whatsAppHref(wa)} label="WhatsApp" />
        ) : null}
      </div>
    </article>
  );
}
