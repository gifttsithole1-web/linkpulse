"use client";

import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ZwWhatsAppField } from "@/components/forms/ZwWhatsAppField";
import { PLACEHOLDER } from "@/components/forms/minimal-form";
import { firestore } from "@/lib/firebaseClient";
import { formatZwWhatsApp } from "@/lib/zimbabwe-phone";

type FormState = {
  name: string;
  surname: string;
  email: string;
  whatsapp_local: string;
  feedback: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function QrLeadForm() {
  const [state, setState] = useState<FormState>({
    name: "",
    surname: "",
    email: "",
    whatsapp_local: "",
    feedback: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "syncing"
  >("idle");
  const [syncNote, setSyncNote] = useState("");

  const whatsappE164 = useMemo(
    () => (state.whatsapp_local ? formatZwWhatsApp(state.whatsapp_local) : null),
    [state.whatsapp_local],
  );

  const canSubmit = useMemo(() => {
    return (
      state.name.trim().length > 0 &&
      state.surname.trim().length > 0 &&
      isValidEmail(state.email.trim()) &&
      Boolean(whatsappE164) &&
      state.feedback.trim().length > 0
    );
  }, [state, whatsappE164]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !whatsappE164 || status === "submitting" || status === "syncing")
      return;

    setStatus("submitting");
    setSyncNote("");

    try {
      await addDoc(collection(firestore, "qr_submissions"), {
        name: state.name.trim(),
        surname: state.surname.trim(),
        email: state.email.trim().toLowerCase(),
        whatsapp_number: whatsappE164,
        phone_number: whatsappE164,
        feedback: state.feedback.trim(),
        syncedToCrm: false,
        createdAt: serverTimestamp(),
      });

      setStatus("syncing");
      try {
        const syncRes = await fetch("/api/qr/sync", { method: "POST" });
        const syncData = (await syncRes.json()) as {
          synced?: number;
          error?: string;
        };
        if (syncRes.ok && (syncData.synced ?? 0) > 0) {
          setSyncNote("You’re in our CRM — we can reach you on WhatsApp.");
        } else if (!syncRes.ok) {
          setSyncNote(
            "Saved — your team can sync from the dashboard when ready.",
          );
        } else {
          setSyncNote("Saved — we’ll add you to contacts shortly.");
        }
      } catch {
        setSyncNote("Saved — sync from the dashboard to add you as a contact.");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Name</span>
          <input
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder={PLACEHOLDER.firstName}
            autoComplete="given-name"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Surname</span>
          <input
            value={state.surname}
            onChange={(e) =>
              setState((s) => ({ ...s, surname: e.target.value }))
            }
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder={PLACEHOLDER.surname}
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-medium text-zinc-700">Email</span>
        <input
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
          placeholder={PLACEHOLDER.email}
          autoComplete="email"
          inputMode="email"
        />
      </label>

      <ZwWhatsAppField
        value={state.whatsapp_local}
        onChange={(local) => setState((s) => ({ ...s, whatsapp_local: local }))}
        hint="For WhatsApp updates and offers — no leading 0 (e.g. 77 123 4567)"
      />

      <label className="space-y-1 text-sm">
        <span className="font-medium text-zinc-700">Suggestions / Feedback</span>
        <textarea
          value={state.feedback}
          onChange={(e) =>
            setState((s) => ({ ...s, feedback: e.target.value }))
          }
          className="min-h-[120px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
          placeholder="Tell us what you’d like LinkPulse to do better..."
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-zinc-500">
          {status === "success" ? (
            <>
              <span className="font-medium text-zinc-700">Thanks — received.</span>
              {syncNote ? <span className="mt-1 block">{syncNote}</span> : null}
            </>
          ) : status === "error" ? (
            "Something went wrong. Please try again."
          ) : status === "syncing" ? (
            "Adding you to LinkPulse contacts…"
          ) : (
            "Scan → submit → we can email and WhatsApp you about offers."
          )}
        </div>
        <button
          type="submit"
          disabled={
            !canSubmit ||
            status === "submitting" ||
            status === "syncing" ||
            status === "success"
          }
          className="rounded-lg bg-[color:var(--lp-navy)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting"
            ? "Submitting..."
            : status === "syncing"
              ? "Syncing..."
              : status === "success"
                ? "Submitted"
                : "Submit"}
        </button>
      </div>
    </form>
  );
}
