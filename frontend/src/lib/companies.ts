import type { Client } from "@/lib/api";

export type CompanyRecord = {
  id: string;
  companyName: string;
  primaryContact: string;
  email: string;
  phone_number: string;
  source?: string | null;
  created_at?: string;
};

export function toCompanyRecords(clients: Client[]): CompanyRecord[] {
  return clients
    .filter((c) => c.account_type === "corporate")
    .map((c) => ({
      id: c.id,
      companyName: c.company_name?.trim() || c.name,
      primaryContact: c.name,
      email: c.email,
      phone_number: c.phone_number,
      source: c.source,
      created_at: c.created_at,
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
}

export function filterCompanies(
  companies: CompanyRecord[],
  query: string,
): CompanyRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return companies;
  return companies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(q) ||
      c.primaryContact.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q),
  );
}
