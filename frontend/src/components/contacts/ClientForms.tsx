"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  awardPointsAction,
  createClientAction,
  deleteClientAction,
  sendMessageAction,
  updateClientAction,
} from "@/lib/actions/clients";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import {
  MinimalField,
  MinimalFormShell,
  MinimalSubmitButton,
  PLACEHOLDER,
  PHONE_PLACEHOLDER,
  minimalHintClass,
  minimalInputClass,
  minimalLabelClass,
} from "@/components/forms/minimal-form";
import { ZwWhatsAppField } from "@/components/forms/ZwWhatsAppField";
import type { ClientDetail } from "@/lib/api";
import {
  e164ToLocalDigits,
  formatZwWhatsApp,
} from "@/lib/zimbabwe-phone";
import { useActionHistory } from "@/hooks/useActionHistory";

export function ClientCreateForm() {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [whatsappLocal, setWhatsappLocal] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const whatsappE164 = whatsappLocal.trim()
      ? formatZwWhatsApp(whatsappLocal)
      : null;
    if (!whatsappE164) {
      setError("Enter a valid WhatsApp number (no leading 0).");
      return;
    }
    startTransition(async () => {
      setError("");
      const result = await createClientAction({
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone_number: String(fd.get("phone_number")),
        whatsapp_number: whatsappE164,
        account_type: fd.get("account_type") as "retail" | "corporate",
        company_name: String(fd.get("company_name") || "") || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      recordHistory(result);
      router.push(`/contacts/${result.data.id}`);
    });
  }

  return (
    <MinimalFormShell
      onSubmit={handleSubmit}
      footer={
        <>
          <MinimalSubmitButton pending={pending}>
            {pending ? "Creating…" : "Create"}
          </MinimalSubmitButton>
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : (
            <p className={minimalHintClass}>Retail or corporate</p>
          )}
        </>
      }
    >
      <MinimalField
        label="Name"
        name="name"
        required
        placeholder={PLACEHOLDER.fullName}
      />
      <MinimalField
        label="Email"
        name="email"
        type="email"
        required
        placeholder={PLACEHOLDER.email}
      />
      <MinimalField
        label="Phone"
        name="phone_number"
        required
        placeholder={PHONE_PLACEHOLDER}
      />
      <ZwWhatsAppField
        value={whatsappLocal}
        onChange={setWhatsappLocal}
        hint="For WhatsApp offers — no leading 0 (e.g. 77 123 4567)"
      />
      <MinimalField
        label="Company"
        name="company_name"
        placeholder={PLACEHOLDER.company}
      />
      <label className="block space-y-1.5">
        <span className={minimalLabelClass}>Type</span>
        <select
          name="account_type"
          defaultValue="retail"
          className={minimalInputClass}
        >
          <option value="retail">Retail</option>
          <option value="corporate">Corporate</option>
        </select>
      </label>
    </MinimalFormShell>
  );
}

function recipientForChannel(
  client: {
    email: string;
    phone_number: string;
    whatsapp_number?: string | null;
  },
  channel: "email" | "sms" | "whatsapp",
): string {
  if (channel === "email") return client.email;
  if (channel === "whatsapp") {
    return client.whatsapp_number ?? client.phone_number;
  }
  return client.phone_number;
}

export function SendMessageForm({
  clientId,
  client,
}: {
  clientId: string;
  client: {
    email: string;
    phone_number: string;
    whatsapp_number?: string | null;
  };
}) {
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [recipient, setRecipient] = useState(() =>
    recipientForChannel(client, "email"),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  return (
    <form
      className="mt-4 space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setError("");
          setSuccessMsg("");
          const result = await sendMessageAction({
            client_id: clientId,
            channel: fd.get("channel") as "email" | "sms" | "whatsapp",
            recipient_address: String(fd.get("recipient_address")),
            message_body: String(fd.get("message_body")),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSuccessMsg(
            "message" in result.data && result.data.message
              ? String(result.data.message)
              : "Message logged.",
          );
          e.currentTarget.reset();
          setChannel("email");
          setRecipient(recipientForChannel(client, "email"));
        });
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Log message
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-zinc-500">Channel</span>
          <select
            name="channel"
            value={channel}
            onChange={(e) => {
              const ch = e.target.value as "email" | "sms" | "whatsapp";
              setChannel(ch);
              setRecipient(recipientForChannel(client, ch));
            }}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Recipient</span>
          <input
            name="recipient_address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-zinc-500">Message</span>
        <textarea
          name="message_body"
          required
          rows={3}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2"
          placeholder="Message content…"
        />
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {successMsg ? (
        <p className="text-xs text-emerald-600">{successMsg}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--dash-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Log message"}
      </button>
    </form>
  );
}

export function AwardPointsForm({ clientId }: { clientId: string }) {
  const recordHistory = useActionHistory();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-2"
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
          else recordHistory(result);
        });
      }}
    >
      <Field label="Sale amount" name="transaction_amount" type="number" required />
      <Field
        label="Margin coef."
        name="margin_coefficient"
        type="number"
        defaultValue="0.1"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 disabled:opacity-60"
      >
        {pending ? "…" : "Award points"}
      </button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </form>
  );
}

export function ClientEditProfileForm({ client }: { client: ClientDetail }) {
  const router = useRouter();
  const recordHistory = useActionHistory();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [whatsappLocal, setWhatsappLocal] = useState(() =>
    e164ToLocalDigits(client.whatsapp_number),
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-[var(--dash-accent)]"
      >
        Edit profile →
      </button>
    );
  }

  return (
    <form
      className="mt-4 space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          setError("");
          setSaved(false);
          const whatsappE164 = whatsappLocal.trim()
            ? formatZwWhatsApp(whatsappLocal)
            : null;
          if (whatsappLocal.trim() && !whatsappE164) {
            setError("Enter a valid WhatsApp number (no leading 0).");
            return;
          }
          const result = await updateClientAction(client.id, {
            name: String(fd.get("name")),
            email: String(fd.get("email")),
            phone_number: String(fd.get("phone_number")),
            whatsapp_number: whatsappE164,
            company_name: String(fd.get("company_name") || "") || null,
            account_type: fd.get("account_type") as "retail" | "corporate",
            marketing_opt_in: fd.get("marketing_opt_in") === "on",
            pipeline_stage: fd.get("pipeline_stage"),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          recordHistory(result);
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Edit profile
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" name="name" defaultValue={client.name} required />
        <Field
          label="Company"
          name="company_name"
          defaultValue={client.company_name ?? ""}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={client.email}
          required
        />
        <Field
          label="Phone"
          name="phone_number"
          defaultValue={client.phone_number}
          required
        />
        <div className="sm:col-span-2">
          <ZwWhatsAppField
            value={whatsappLocal}
            onChange={setWhatsappLocal}
            required={false}
            hint="For WhatsApp campaigns — no leading 0"
          />
        </div>
        <label className="block text-sm sm:col-span-2">
          <span className="text-zinc-500">Account type</span>
          <select
            name="account_type"
            defaultValue={client.account_type}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2"
          >
            <option value="retail">Retail</option>
            <option value="corporate">Corporate</option>
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-zinc-500">Pipeline stage</span>
          <select
            name="pipeline_stage"
            defaultValue={client.pipeline_stage ?? "lead"}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="marketing_opt_in"
            defaultChecked={client.marketing_opt_in}
            className="rounded border-zinc-300"
          />
          <span className="text-zinc-700">Marketing opt-in</span>
        </label>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {saved ? (
        <p className="text-xs text-emerald-600">Profile saved.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm text-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function DeleteClientButton({
  client,
  backHref,
}: {
  client: Pick<ClientDetail, "id" | "name" | "account_type">;
  backHref: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const kind = client.account_type === "corporate" ? "company" : "contact";
          if (
            !window.confirm(
              `Delete ${client.name} permanently? This removes loyalty and all messages.`,
            )
          ) {
            return;
          }
          startTransition(async () => {
            setError("");
            const result = await deleteClientAction(client.id);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push(backHref);
            router.refresh();
          });
        }}
        className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function EditContextForm({ client }: { client: ClientDetail }) {
  const recordHistory = useActionHistory();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const isRetail = client.account_type === "retail";
  const field = isRetail ? "brand_specs" : "it_infrastructure";
  const current = isRetail ? client.brand_specs : client.it_infrastructure;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-[var(--dash-accent)]"
      >
        Edit {isRetail ? "brand specs" : "IT profile"} →
      </button>
    );
  }

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = String(new FormData(e.currentTarget).get("json"));
        startTransition(async () => {
          setError("");
          try {
            const parsed = raw.trim() ? JSON.parse(raw) : null;
            const result = await updateClientAction(client.id, {
              [field]: parsed,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            recordHistory(result);
            setOpen(false);
          } catch {
            setError("Invalid JSON");
          }
        });
      }}
    >
      <textarea
        name="json"
        rows={6}
        defaultValue={
          current ? JSON.stringify(current, null, 2) : '{\n  "notes": ""\n}'
        }
        className="w-full rounded-xl border border-zinc-200 font-mono text-xs"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm text-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-zinc-500">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        step={type === "number" ? "any" : undefined}
        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2"
      />
    </label>
  );
}
