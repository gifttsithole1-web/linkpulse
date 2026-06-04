"use client";

import { useRouter } from "next/navigation";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { SyncNowButton } from "@/components/SyncNowButton";
import { crmNavigation } from "@/config/crm-navigation";

const item = crmNavigation[2].items[2];

export default function AcquisitionSyncPage() {
  const router = useRouter();

  return (
    <CrmPageShell item={item}>
      <div className="dash-card max-w-xl min-w-0 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-zinc-900">QR → Firestore CRM</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Pulls unsynced documents from{" "}
          <code className="rounded bg-zinc-100 px-1">qr_submissions</code>, creates or
          updates <code className="rounded bg-zinc-100 px-1">clients</code>, and stores{" "}
          <code className="rounded bg-zinc-100 px-1">feedback_submissions</code> — all in
          Firebase. No Laravel required.
        </p>
        <div className="mt-6 flex justify-start">
          <SyncNowButton onSynced={() => router.refresh()} />
        </div>
        <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-zinc-600">
          <li>Customer submits on /qr → Firestore buffer</li>
          <li>Click Sync now (or auto-sync after submit)</li>
          <li>View results in Contacts and Feedback inbox</li>
        </ol>
      </div>
    </CrmPageShell>
  );
}
