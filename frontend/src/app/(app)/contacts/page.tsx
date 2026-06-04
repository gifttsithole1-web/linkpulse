import Link from "next/link";
import { ContactGridCard } from "@/components/contacts/ContactGridCard";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { getClients } from "@/lib/api";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients({ per_page: 500 });
  const query = q?.trim().toLowerCase() ?? "";
  const list = (clients?.data ?? []).filter((client) => {
    if (!query) return true;
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.company_name?.toLowerCase().includes(query) ||
      client.phone_number?.toLowerCase().includes(query) ||
      client.whatsapp_number?.toLowerCase().includes(query)
    );
  });

  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody>
        <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-zinc-900">Contacts</h1>
            <p className="mt-1 text-xs text-zinc-500">
              {list.length} {list.length === 1 ? "contact" : "contacts"}
              {query ? ` · “${q}”` : ""}
            </p>
          </div>
          <Link
            href="/contacts/new"
            className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Add contact
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((client) => (
            <ContactGridCard key={client.id} client={client} />
          ))}

          {!list.length && (
            <p className="col-span-full py-12 text-center text-sm text-zinc-500">
              {query ? (
                "No matches."
              ) : (
                <>
                  No contacts.{" "}
                  <Link
                    href="/contacts/new"
                    className="text-zinc-700 underline-offset-2 hover:underline"
                  >
                    Add one
                  </Link>
                </>
              )}
            </p>
          )}
        </section>
      </AppPageBody>
    </AppPage>
  );
}
