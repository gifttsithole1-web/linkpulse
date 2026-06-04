"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  minimalHintClass,
  minimalInputClass,
  minimalLabelClass,
} from "@/components/forms/minimal-form";
import { updateSettingsAction } from "@/lib/actions/engagement";
import type { AppSettings } from "@/lib/api";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <form
      className="dash-card max-w-lg space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setMessage("");
          const result = await updateSettingsAction({
            default_margin_coefficient: Number(fd.get("default_margin_coefficient")),
          });
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          setMessage("Settings saved.");
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold text-zinc-900">CRM preferences</h2>
      <label className="block space-y-2">
        <span className={minimalLabelClass}>Default margin coefficient</span>
        <input
          name="default_margin_coefficient"
          type="number"
          step="any"
          min={0}
          defaultValue={settings.default_margin_coefficient}
          className={minimalInputClass}
        />
        <p className={minimalHintClass}>Points = sale amount × margin (loyalty awards)</p>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
      {message ? <p className={minimalHintClass}>{message}</p> : null}
    </form>
  );
}
