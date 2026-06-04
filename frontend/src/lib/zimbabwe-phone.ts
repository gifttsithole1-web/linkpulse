/** Zimbabwe mobile: +263, local number without leading 0 (e.g. 77 123 4567). */

export function stripToLocalDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("263")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** Returns E.164 e.g. +263771234567 or null if invalid. */
export function formatZwWhatsApp(localDigits: string): string | null {
  const local = stripToLocalDigits(localDigits);
  // Zimbabwe mobile: 9 digits (71–78…) or legacy 10-digit formats
  if (!/^[1-9]\d{8,9}$/.test(local)) return null;
  return `+263${local}`;
}

export function isValidZwLocalDigits(localDigits: string): boolean {
  return formatZwWhatsApp(localDigits) !== null;
}

export function whatsAppHref(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

/** Local digits for editing a stored +263… value in ZwWhatsAppField. */
export function e164ToLocalDigits(e164: string | null | undefined): string {
  if (!e164?.trim()) return "";
  return stripToLocalDigits(e164);
}
