/**
 * CRM data access — Firebase Firestore via Admin SDK (server-only).
 */

export type PaginatedResponse<T> = {
  data: T[];
};

export type Client = {
  id: string;
  name: string;
  company_name?: string | null;
  email: string;
  phone_number: string;
  whatsapp_number?: string | null;
  account_type: "retail" | "corporate";
  brand_specs?: Record<string, unknown> | null;
  it_infrastructure?: Record<string, unknown> | null;
  marketing_opt_in?: boolean;
  source?: string | null;
  pipeline_stage?: "lead" | "quote" | "won" | "production";
  created_at?: string;
  updated_at?: string;
  loyalty_account?: {
    points_balance: number;
    tier_level: string;
    lifetime_points: number;
  } | null;
};

export type LoyaltyAccountDetail = {
  id: string;
  client_id: string;
  points_balance: number;
  tier_level: string;
  lifetime_points: number;
};

export type CommunicationLogDetail = CommunicationLog & {
  client_id: string;
  message_body: string;
  sent_at: string | null;
  provider_message_id?: string | null;
};

export type ClientDetail = Client & {
  loyalty_account: LoyaltyAccountDetail | null;
  communication_logs: CommunicationLogDetail[];
  feedback_submissions: FeedbackSubmission[];
};

export type LoyaltyAccount = {
  id: string;
  client_id: string;
  points_balance: number;
  tier_level: string;
  lifetime_points?: number;
  client: Pick<Client, "name" | "email" | "account_type"> & { id: string };
};

export type CommunicationLog = {
  id: string;
  client_id?: string;
  channel: "email" | "sms" | "whatsapp";
  status: "pending" | "queued" | "sent" | "delivered" | "failed";
  recipient_address: string;
  message_body?: string;
  provider_message_id?: string | null;
  created_at: string;
  client?: Pick<Client, "id" | "name" | "email" | "company_name" | "account_type">;
};

export type AppSettings = {
  default_margin_coefficient: number;
  weekly_updates_enabled: boolean;
};

export type FeedbackSubmission = {
  id: string;
  name: string;
  surname: string;
  email: string;
  feedback: string;
  source: string;
  firestore_id: string | null;
  created_at: string;
};

async function withFirestore<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error("[firestore]", e);
    return null;
  }
}

export async function getClients(params?: { per_page?: number }) {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) =>
      m.listClients(params?.per_page ?? 500),
    ),
  );
}

export async function getClient(id: string) {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.getClientById(id)),
  );
}

export async function getLoyaltyAccounts() {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.listLoyaltyAccounts()),
  );
}

export async function getCommunicationLogs() {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.listCommunicationLogs()),
  );
}

export async function getFeedbackSubmissions() {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.listFeedbackSubmissions()),
  );
}

export async function getSettings() {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.getSettings()),
  );
}

export async function getCommunicationLogsFiltered(params?: {
  status?: string;
  channel?: string;
}) {
  return withFirestore(() =>
    import("@/lib/firestore/crm").then((m) => m.listCommunicationLogs(params)),
  );
}
