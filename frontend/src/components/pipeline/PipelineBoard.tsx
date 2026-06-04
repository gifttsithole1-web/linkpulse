"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Client } from "@/lib/api";
import { updatePipelineStageAction } from "@/lib/actions/clients";
import { useActionHistory } from "@/hooks/useActionHistory";
import {
  PIPELINE_STAGES,
  groupClientsByStage,
  type PipelineStageId,
} from "@/lib/pipeline";

function clientHref(client: Client) {
  return client.account_type === "corporate"
    ? `/companies/${client.id}`
    : `/contacts/${client.id}`;
}

function clientLabel(client: Client) {
  return client.account_type === "corporate" && client.company_name
    ? client.company_name
    : client.name;
}

export function PipelineBoard({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [filter, setFilter] = useState<"all" | "retail" | "corporate">("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "all") return clients;
    return clients.filter((c) => c.account_type === filter);
  }, [clients, filter]);

  const columns = groupClientsByStage(filtered);

  function moveClient(clientId: string, stage: PipelineStageId) {
    startTransition(async () => {
      const result = await updatePipelineStageAction(clientId, stage);
      if (result.ok) recordHistory(result);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "retail", "corporate"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
              filter === f
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200",
            ].join(" ")}
          >
            {f === "all" ? "All accounts" : f}
          </button>
        ))}
        {pending ? (
          <span className="self-center text-xs text-zinc-500">Saving…</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="dash-card flex min-w-0 flex-col">
            <div className="border-b border-zinc-100 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-zinc-900">{col.label}</h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {col.clients.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{col.hint}</p>
            </div>
            <ul className="app-scroll max-h-[min(420px,50vh)] flex-1 space-y-2 overflow-y-auto p-3">
              {col.clients.map((client) => (
                <li
                  key={client.id}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3"
                >
                  <Link
                    href={clientHref(client)}
                    className="block font-medium text-zinc-900 hover:text-[var(--dash-accent)]"
                  >
                    {clientLabel(client)}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{client.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={[
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        client.account_type === "corporate"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      {client.account_type}
                    </span>
                    {client.loyalty_account ? (
                      <span className="text-[10px] text-zinc-500">
                        {client.loyalty_account.points_balance} pts
                      </span>
                    ) : null}
                  </div>
                  <label className="mt-3 block">
                    <span className="sr-only">Move stage</span>
                    <select
                      value={client.pipeline_stage ?? "lead"}
                      disabled={pending}
                      onChange={(e) =>
                        moveClient(client.id, e.target.value as PipelineStageId)
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-800"
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          → {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
              {!col.clients.length ? (
                <li className="py-6 text-center text-xs text-zinc-400">
                  No deals in this stage
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
