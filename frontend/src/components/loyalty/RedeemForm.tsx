"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { redeemPointsAction } from "@/lib/actions/engagement";
import { useActionHistory } from "@/hooks/useActionHistory";
import {
  minimalHintClass,
  minimalInputClass,
  minimalLabelClass,
} from "@/components/forms/minimal-form";

const REWARDS = [
  { label: "1hr diagnostics", points: 500 },
  { label: "2hr support block", points: 900 },
  { label: "Print credit $50", points: 1200 },
  { label: "Brand audit", points: 2000 },
];

export function RedeemForm({
  accounts,
}: {
  accounts: Array<{
    id: string;
    points_balance: number;
    client: { name: string; email: string };
  }>;
}) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  if (!accounts.length) {
    return null;
  }

  return (
    <form
      className="dash-card space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const reward = REWARDS[Number(fd.get("reward_index"))];
        startTransition(async () => {
          setMessage("");
          const result = await redeemPointsAction(
            String(fd.get("client_id")),
            reward.points,
            reward.label,
          );
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          recordHistory(result);
          setMessage(`Redeemed: ${reward.label}`);
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold text-zinc-900">Redeem points</h2>
      <label className="block space-y-2">
        <span className={minimalLabelClass}>Client</span>
        <select name="client_id" className={minimalInputClass} required>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.client.name} — {a.points_balance.toLocaleString()} pts
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2">
        <span className={minimalLabelClass}>Reward</span>
        <select name="reward_index" className={minimalInputClass} required>
          {REWARDS.map((r, i) => (
            <option key={r.label} value={i}>
              {r.label} ({r.points} pts)
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Redeeming…" : "Redeem"}
      </button>
      {message ? <p className={minimalHintClass}>{message}</p> : null}
    </form>
  );
}
