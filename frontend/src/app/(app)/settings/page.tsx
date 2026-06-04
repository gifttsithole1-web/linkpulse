import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { SettingsForm } from "@/components/system/SettingsForm";
import { getNavItemByHref } from "@/config/crm-navigation";
import { getSettings } from "@/lib/api";

export default async function SettingsPage() {
  const nav = getNavItemByHref("/settings");
  const settings = await getSettings();

  const defaults = {
    default_margin_coefficient: 0.1,
    weekly_updates_enabled: true,
  };

  return (
    <CrmPageShell item={nav}>
      <SettingsForm settings={settings ?? defaults} />
      <section className="dash-card max-w-lg min-w-0 p-4 text-sm text-zinc-600 sm:p-5">
        <h2 className="font-semibold text-zinc-900">Environment</h2>
        <ul className="mt-3 space-y-2 break-all text-xs">
          <li>
            <span className="text-zinc-400">Firebase project </span>
            {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "—"}
          </li>
          <li>
            <span className="text-zinc-400">App URL </span>
            {process.env.NEXT_PUBLIC_APP_URL ?? "—"}
          </li>
          <li>
            <span className="text-zinc-400">Admin SDK </span>
            {process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_B64 ? "configured" : "missing"}
          </li>
          <li>
            <span className="text-zinc-400">Brevo </span>
            {process.env.BREVO_API_KEY ? "API key set" : "not configured"}
          </li>
        </ul>
      </section>
    </CrmPageShell>
  );
}
