"use client";

import { useState } from "react";

type SyncNowButtonProps = {
  onSynced?: () => void;
};

export function SyncNowButton({ onSynced }: SyncNowButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sync() {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/qr/sync", { method: "POST" });
      const data = (await res.json()) as { synced?: number; error?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Sync failed. Check server env (Firebase admin + secret).");
        return;
      }

      setStatus("done");
      setMessage(
        `Synced ${data.synced ?? 0} QR submission(s) — clients + feedback updated.`,
      );
      onSynced?.();
    } catch {
      setStatus("error");
      setMessage("Could not reach sync endpoint.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={sync}
        disabled={status === "loading"}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "loading" ? "Syncing…" : "Sync now"}
      </button>
      {message ? (
        <p
          className={`max-w-xs text-right text-xs ${
            status === "error" ? "text-red-600" : "text-zinc-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
