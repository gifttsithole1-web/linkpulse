"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addLoyaltyMemberAction } from "@/lib/actions/loyalty";
import { useActionHistory } from "@/hooks/useActionHistory";
import type { Client } from "@/lib/api";

export function LoyaltyAddMember({
  eligible,
}: {
  eligible: Pick<Client, "id" | "name" | "email" | "account_type">[];
}) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [clientId, setClientId] = useState(eligible[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (!eligible.length) {
    return (
      <p className="text-sm text-zinc-500">
        All contacts are on the ledger.{" "}
        <Link href="/contacts/new" className="text-zinc-700 underline-offset-2 hover:underline">
          Add a contact
        </Link>{" "}
        first.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (!clientId) return;
        startTransition(async () => {
          setError("");
          const result = await addLoyaltyMemberAction(clientId);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          recordHistory(result);
          router.refresh();
        });
      }}
    >
      <label className="min-w-0 flex-1 text-sm">
        <span className="text-xs text-zinc-500">Add member</span>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
        >
          {eligible.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.email}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending || !clientId}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add to ledger"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
