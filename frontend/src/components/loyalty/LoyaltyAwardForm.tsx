"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { awardPointsAction } from "@/lib/actions/clients";
import { useActionHistory } from "@/hooks/useActionHistory";
import {
  minimalHintClass,
  minimalInputClass,
  minimalLabelClass,
} from "@/components/forms/minimal-form";

export function LoyaltyAwardForm({
  clientId,
  defaultMargin,
}: {
  clientId: string;
  defaultMargin: number;
}) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setError("");
          const result = await awardPointsAction(
            clientId,
            Number(fd.get("transaction_amount")),
            Number(fd.get("margin_coefficient")),
          );
          if (!result.ok) setError(result.error);
          else {
            recordHistory(result);
            router.refresh();
          }
        });
      }}
    >
      <label className="block text-sm">
        <span className={minimalLabelClass}>Sale</span>
        <input
          name="transaction_amount"
          type="number"
          required
          min={0}
          step="any"
          className={`${minimalInputClass} w-24`}
        />
      </label>
      <label className="block text-sm">
        <span className={minimalLabelClass}>Margin</span>
        <input
          name="margin_coefficient"
          type="number"
          required
          step="any"
          defaultValue={defaultMargin}
          className={`${minimalInputClass} w-20`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 disabled:opacity-50"
      >
        {pending ? "…" : "Award"}
      </button>
      {error ? <p className={`${minimalHintClass} text-red-600`}>{error}</p> : null}
    </form>
  );
}
