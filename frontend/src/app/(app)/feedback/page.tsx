import Link from "next/link";
import { getFeedbackSubmissions } from "@/lib/api";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";

export default async function FeedbackPage() {
  const submissions = await getFeedbackSubmissions();

  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody>
        <section className="dash-card min-w-0 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Feedback
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                QR landing submissions synced from Firestore into LinkPulse CRM.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              ← Dashboard
            </Link>
          </div>
        </section>

        <section className="dash-card min-w-0 overflow-hidden">
          <div className="border-b border-zinc-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:px-5">
            Submissions ({submissions?.data.length ?? 0})
          </div>

          <div className="divide-y divide-zinc-100">
            {(submissions?.data ?? []).map((row) => (
              <article key={row.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
                  <div className="min-w-0 font-medium text-zinc-900">
                    {row.name} {row.surname}
                  </div>
                  <div className="shrink-0 text-xs text-zinc-500">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="mt-1 truncate text-sm text-zinc-600">{row.email}</div>
                <p className="mt-3 break-words rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                  {row.feedback}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5">
                    source: {row.source}
                  </span>
                  {row.firestore_id ? (
                    <span className="max-w-full truncate rounded-md bg-zinc-100 px-2 py-0.5">
                      firestore: {row.firestore_id}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}

            {!submissions?.data?.length && (
              <div className="px-4 py-10 text-center text-sm text-zinc-600 sm:px-5">
                No feedback yet. Submit via{" "}
                <Link href="/qr" className="font-medium text-zinc-900 underline">
                  /qr
                </Link>
                , then click <strong>Sync now</strong> on the dashboard.
              </div>
            )}
          </div>
        </section>
      </AppPageBody>
    </AppPage>
  );
}
