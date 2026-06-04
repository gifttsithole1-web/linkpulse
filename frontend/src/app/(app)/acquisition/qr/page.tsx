import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { QrLandingPanel } from "@/components/QrLandingPanel";
import Link from "next/link";
import { crmNavigation } from "@/config/crm-navigation";

const item = crmNavigation[2].items[0];

export default function AcquisitionQrPage() {
  return (
    <CrmPageShell item={item}>
      <div className="grid max-w-4xl gap-4">
        <QrLandingPanel />
        <div className="dash-card space-y-2 p-5 text-sm text-zinc-600">
          <p>
            Public landing:{" "}
            <Link href="/qr" className="font-medium text-[var(--dash-accent)]">
              /qr
            </Link>
            . Each scan + submit creates or updates a <strong>retail</strong> client
            (tagged <code className="rounded bg-zinc-100 px-1">source: qr</code>) with
            loyalty and feedback in CRM.
          </p>
          <p className="text-xs text-zinc-500">
            Flow: form → Firestore → auto-sync (or <strong>Sync now</strong> on dashboard)
            → Contacts &amp; Feedback.
          </p>
        </div>
      </div>
    </CrmPageShell>
  );
}
