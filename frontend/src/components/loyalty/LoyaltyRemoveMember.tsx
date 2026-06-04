"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeLoyaltyMemberAction } from "@/lib/actions/loyalty";
import { useActionHistory } from "@/hooks/useActionHistory";

export function LoyaltyRemoveMember({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              `Remove ${clientName} from the loyalty ledger? Points balance will be cleared.`,
            )
          ) {
            return;
          }
          startTransition(async () => {
            setError("");
            const result = await removeLoyaltyMemberAction(clientId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            recordHistory(result);
            router.refresh();
          });
        }}
        className="text-xs text-zinc-400 transition hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
