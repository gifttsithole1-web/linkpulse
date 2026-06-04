import Link from "next/link";
import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { getNavItemByHref } from "@/config/crm-navigation";
import { isBrevoConfigured } from "@/lib/brevo";
import { getClients } from "@/lib/api";

async function checkFirestore() {
  return (await getClients({ per_page: 1 })) !== null;
}

export default async function IntegrationsPage() {
  const nav = getNavItemByHref("/integrations");
  const firestoreOk = await checkFirestore();
  const hasAdmin = Boolean(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_B64);
  const hasClientConfig = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const brevoOk = isBrevoConfigured();

  const items = [
    {
      name: "Firebase Firestore",
      description: "Primary CRM database (clients, loyalty, messages, feedback, settings)",
      status: firestoreOk && hasAdmin ? "connected" : "disconnected",
      href: null,
    },
    {
      name: "Firebase client (QR)",
      description: `Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "not set"}`,
      status: hasClientConfig ? "connected" : "disconnected",
      href: "/acquisition/qr",
    },
    {
      name: "QR ingest",
      description: "qr_submissions → sync route → Firestore CRM collections",
      status: hasAdmin ? "connected" : "disconnected",
      href: "/acquisition/sync",
    },
    {
      name: "Brevo (email)",
      description: brevoOk
        ? `Sender: ${process.env.BREVO_SENDER_EMAIL} — campaigns & contact email`
        : "Add BREVO_API_KEY + BREVO_SENDER_EMAIL to .env.local",
      status: brevoOk ? "connected" : "disconnected",
      href: "/automations",
    },
    {
      name: "Twilio / SMS",
      description: "Wire provider for live SMS and WhatsApp delivery",
      status: "planned",
      href: null,
    },
  ];

  return (
    <CrmPageShell item={nav}>
      <section className="dash-card min-w-0 divide-y divide-zinc-100">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-900">{item.name}</p>
              <p className="break-all text-sm text-zinc-600">{item.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge
                status={
                  item.status === "connected"
                    ? "delivered"
                    : item.status === "planned"
                      ? "pending"
                      : "failed"
                }
              />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-[var(--dash-accent)]"
                >
                  Configure →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </section>
      {!brevoOk ? (
        <section className="dash-card mt-4 p-4 text-sm text-zinc-600 sm:p-5">
          <h2 className="font-semibold text-zinc-900">Set up Brevo</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Create a free account at{" "}
              <a
                href="https://www.brevo.com"
                className="text-[var(--dash-accent)] underline"
                target="_blank"
                rel="noreferrer"
              >
                brevo.com
              </a>
            </li>
            <li>SMTP &amp; API → generate an API key</li>
            <li>Senders → verify your from email domain</li>
            <li>
              Add to <code className="rounded bg-zinc-100 px-1">frontend/.env.local</code>:
              BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
            </li>
          </ol>
        </section>
      ) : null}
    </CrmPageShell>
  );
}
