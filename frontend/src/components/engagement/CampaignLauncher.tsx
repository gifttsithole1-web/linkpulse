"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  minimalHintClass,
  minimalInputClass,
  minimalLabelClass,
} from "@/components/forms/minimal-form";
import { launchCampaignAction } from "@/lib/actions/engagement";

export function CampaignLauncher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <form
      className="dash-card min-w-0 space-y-4 p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setMessage("");
          const result = await launchCampaignAction({
            name: String(fd.get("name")),
            channel: fd.get("channel") as "email" | "sms" | "whatsapp",
            message_body: String(fd.get("message_body")),
            audience: fd.get("audience") as "all" | "opt_in" | "retail" | "corporate",
          });
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          const d = result.data;
          setMessage(
            d.viaBrevo
              ? `Brevo: ${d.sent} sent, ${d.failed} failed (${d.total} recipients).`
              : fd.get("channel") === "email"
                ? `Queued ${d.queued} emails — add BREVO_API_KEY to send.`
                : `Logged ${d.sent} of ${d.total} (SMS/WhatsApp not wired yet).`,
          );
          router.refresh();
        });
      }}
    >
      <h2 className="font-semibold text-zinc-900">Launch campaign</h2>
      <p className="text-sm text-zinc-600">
        Email campaigns send via Brevo when{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs">BREVO_API_KEY</code> is set.
        SMS/WhatsApp are logged only until Twilio is connected.
      </p>
      <label className="block space-y-2">
        <span className={minimalLabelClass}>Campaign name</span>
        <input
          name="name"
          required
          placeholder="June product update"
          className={minimalInputClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className={minimalLabelClass}>Channel</span>
          <select name="channel" defaultValue="email" className={minimalInputClass}>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className={minimalLabelClass}>Audience</span>
          <select name="audience" defaultValue="opt_in" className={minimalInputClass}>
            <option value="opt_in">Marketing opt-in</option>
            <option value="all">All contacts</option>
            <option value="retail">Retail only</option>
            <option value="corporate">Corporate only</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className={minimalLabelClass}>Message</span>
        <textarea
          name="message_body"
          required
          rows={4}
          className={minimalInputClass}
          placeholder="Mhoro! Tinokugadzirisa nezviwanikwa zvedu zvitsva…"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Launching…" : "Launch"}
        </button>
        {message ? <p className={minimalHintClass}>{message}</p> : null}
      </div>
    </form>
  );
}
