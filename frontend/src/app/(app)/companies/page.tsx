import Link from "next/link";
import { FiBriefcase, FiPlus } from "react-icons/fi";
import { ClientRowMenu } from "@/components/contacts/ClientRowMenu";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { getClients } from "@/lib/api";
import { filterCompanies, toCompanyRecords } from "@/lib/companies";
import { getNavItemByHref } from "@/config/crm-navigation";

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700">
      {initials || "Co"}
    </div>
  );
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const nav = getNavItemByHref("/companies");
  const clients = await getClients({ per_page: 500 });
  const companies = filterCompanies(
    toCompanyRecords(clients?.data ?? []),
    q ?? "",
  );

  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody>
        <section className="flex flex-col gap-4 border-b border-zinc-200/80 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {nav.label}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{nav.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex items-center gap-2" action="/companies" method="get">
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search companies…"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Search
              </button>
            </form>
            <Link
              href="/companies/new"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <FiPlus className="h-4 w-4" />
              Add company
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <span className="dash-pill bg-indigo-50 text-indigo-700">
            {companies.length} corporate account{companies.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/contacts"
            className="dash-pill bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"
          >
            All contacts →
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="dash-card block p-5 transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <CompanyAvatar name={company.companyName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-semibold text-zinc-900">
                      {company.companyName}
                    </h2>
                    <ClientRowMenu
                      client={{
                        id: company.id,
                        name: company.companyName,
                        account_type: "corporate",
                      }}
                      detailHref={`/companies/${company.id}`}
                    />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-zinc-600">
                    {company.primaryContact}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-zinc-600">
                <p className="truncate">{company.email}</p>
                <p className="truncate">{company.phone_number}</p>
              </div>
              {company.source ? (
                <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-400">
                  Source: {company.source}
                </p>
              ) : null}
            </Link>
          ))}

          {!companies.length && (
            <div className="col-span-full dash-card p-10 text-center">
              <FiBriefcase className="mx-auto h-10 w-10 text-indigo-200" />
              <p className="mt-4 text-sm text-zinc-600">
                {q
                  ? `No companies match "${q}".`
                  : "No corporate accounts yet."}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Add a B2B company or set a contact&apos;s account type to corporate.
              </p>
              <Link
                href="/companies/new"
                className="mt-6 inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                Add company
              </Link>
            </div>
          )}
        </section>
      </AppPageBody>
    </AppPage>
  );
}
