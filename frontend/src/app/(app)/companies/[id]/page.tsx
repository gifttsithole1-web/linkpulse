import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Client360 } from "@/components/contacts/Client360";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { getClient } from "@/lib/api";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    redirect("/companies/new");
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
          <p className="text-sm text-zinc-600">Company not found.</p>
          <Link
            href="/companies"
            className="mt-4 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to companies
          </Link>
        </AppPageBody>
      </AppPage>
    );
  }

  if (client.account_type !== "corporate") {
    redirect(`/contacts/${client.id}`);
  }

  return (
    <Client360
      client={client}
      backHref="/companies"
      backLabel="← Companies"
    />
  );
}
