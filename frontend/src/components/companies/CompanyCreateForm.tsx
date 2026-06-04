"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  MinimalField,
  MinimalFormShell,
  MinimalSubmitButton,
  PLACEHOLDER,
  PHONE_PLACEHOLDER,
  minimalHintClass,
} from "@/components/forms/minimal-form";
import { ZwWhatsAppField } from "@/components/forms/ZwWhatsAppField";
import { createClientAction } from "@/lib/actions/clients";
import { useActionHistory } from "@/hooks/useActionHistory";
import { formatZwWhatsApp } from "@/lib/zimbabwe-phone";

export function CompanyCreateForm() {
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
      const company = String(fd.get("company_name")).trim();
      const contact = String(fd.get("contact_name")).trim();
      const result = await createClientAction({
        name: contact,
        company_name: company,
        email: String(fd.get("email")),
        phone_number: String(fd.get("phone_number")),
        whatsapp_number: whatsappE164,
        account_type: "corporate",
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      recordHistory(result);
      router.push(`/companies/${result.data.id}`);
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
            <p className={minimalHintClass}>Corporate · IT profile ready to edit</p>
          )}
        </>
      }
    >
      <MinimalField
        label="Company"
        name="company_name"
        required
        placeholder={PLACEHOLDER.company}
      />
      <MinimalField
        label="Primary contact"
        name="contact_name"
        required
        placeholder={PLACEHOLDER.contactName}
      />
      <MinimalField
        label="Email"
        name="email"
        type="email"
        required
        placeholder={PLACEHOLDER.workEmail}
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
    </MinimalFormShell>
  );
}
