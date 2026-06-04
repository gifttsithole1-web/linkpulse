"use client";

import {
  formatZwWhatsApp,
  stripToLocalDigits,
} from "@/lib/zimbabwe-phone";

type ZwWhatsAppFieldProps = {
  label?: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (localDigits: string) => void;
  onValidE164?: (e164: string | null) => void;
};

export function ZwWhatsAppField({
  label = "WhatsApp",
  hint = "Enter your number without the leading 0 (e.g. 77 123 4567)",
  required = true,
  value,
  onChange,
  onValidE164,
}: ZwWhatsAppFieldProps) {
  const e164 = value.trim() ? formatZwWhatsApp(value) : null;
  const showError = value.trim().length > 0 && !e164;

  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-zinc-700">
        {label}
        {required ? (
          <span className="text-red-500"> *</span>
        ) : (
          <span className="font-normal text-zinc-400"> (optional)</span>
        )}
      </span>
      <div className="flex overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:border-zinc-400">
        <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
          +263
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => {
            const local = stripToLocalDigits(e.target.value);
            onChange(local);
            onValidE164?.(local ? formatZwWhatsApp(local) : null);
          }}
          placeholder="77 123 4567"
          className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
          aria-invalid={showError}
        />
      </div>
      {showError ? (
        <p className="text-xs text-red-600">
          Enter a valid Zimbabwe mobile number (no leading 0).
        </p>
      ) : e164 ? (
        <p className="text-xs text-zinc-500">Saved as {e164}</p>
      ) : (
        <p className="text-xs text-zinc-500">{hint}</p>
      )}
    </label>
  );
}
