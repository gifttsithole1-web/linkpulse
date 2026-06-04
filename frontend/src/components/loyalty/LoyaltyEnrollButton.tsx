"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addLoyaltyMemberAction } from "@/lib/actions/loyalty";
import { useActionHistory } from "@/hooks/useActionHistory";

export function LoyaltyEnrollButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setError("");
            const result = await addLoyaltyMemberAction(clientId);
            if (!result.ok) setError(result.error);
            else {
              recordHistory(result);
              router.refresh();
            }
          });
        }}
        className="text-sm font-medium text-[var(--dash-accent)] hover:underline disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add to loyalty ledger →"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
