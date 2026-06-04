import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Client360 } from "@/components/contacts/Client360";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { getClient } from "@/lib/api";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    redirect("/contacts/new");
  }

  if (!id?.trim()) {
    notFound();
  }

  const client = await getClient(id);
  if (!client) {
    return (
      <AppPage>
        <AppTopBar />
        <AppPageBody className="flex flex-col items-center justify-center">
          <p className="max-w-md text-center text-sm text-zinc-600">
            Client not found. Check Firebase config (
            <code className="rounded bg-zinc-100 px-1 text-xs">
              FIREBASE_ADMIN_SERVICE_ACCOUNT_B64
            </code>
            ).
          </p>
          <Link
            href="/contacts"
            className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to contacts
          </Link>
        </AppPageBody>
      </AppPage>
    );
  }

  return <Client360 client={client} />;
}
