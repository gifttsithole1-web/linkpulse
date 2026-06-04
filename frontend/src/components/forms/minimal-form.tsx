export const PHONE_PLACEHOLDER = "+263 77 123 4567";

/** Example placeholders — Zimbabwe Shona names */
export const PLACEHOLDER = {
  firstName: "Tinashe",
  surname: "Moyo",
  fullName: "Tinashe Moyo",
  contactName: "Tendai Chigumba",
  company: "Muzinda Holdings",
  email: "tinashe.moyo@email.co.zw",
  workEmail: "tendai.chigumba@company.co.zw",
} as const;

export const minimalInputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-500 focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent-soft)]";

export const minimalLabelClass =
  "text-xs font-semibold uppercase tracking-wide text-zinc-600";

export const minimalHintClass = "text-xs text-zinc-500";

export function MinimalField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className={minimalLabelClass}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={minimalInputClass}
      />
    </label>
  );
}

export function MinimalFormShell({
  children,
  onSubmit,
  footer,
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  footer: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md space-y-5 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm"
    >
      {children}
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-5">
        {footer}
      </div>
    </form>
  );
}

export function MinimalSubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
