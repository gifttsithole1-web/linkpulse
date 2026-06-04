import {
  FieldValue,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { formatZwWhatsApp } from "@/lib/zimbabwe-phone";
import type {
  AppSettings,
  Client,
  ClientDetail,
  CommunicationLog,
  CommunicationLogDetail,
  FeedbackSubmission,
  LoyaltyAccount,
  LoyaltyAccountDetail,
  PaginatedResponse,
} from "@/lib/api";

const COL = {
  clients: "clients",
  communication_logs: "communication_logs",
  feedback_submissions: "feedback_submissions",
  settings: "settings",
  qr_submissions: "qr_submissions",
} as const;

const SETTINGS_DOC = "app";

type LoyaltyFields = {
  points_balance: number;
  tier_level: string;
  lifetime_points: number;
};

type ClientDoc = {
  name: string;
  company_name: string | null;
  email: string;
  phone_number: string;
  whatsapp_number: string | null;
  account_type: "retail" | "corporate";
  brand_specs: Record<string, unknown> | null;
  it_infrastructure: Record<string, unknown> | null;
  marketing_opt_in: boolean;
  source: string | null;
  pipeline_stage: Client["pipeline_stage"];
  loyalty?: LoyaltyFields | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function tsToIso(v: unknown): string | undefined {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === "string") return v;
  return undefined;
}

function createdAtMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "string") return new Date(v).getTime() || 0;
  return 0;
}

/** Avoid composite indexes: filter in Firestore, sort in memory. */
function sortDocsByCreatedAtDesc(docs: QueryDocumentSnapshot<DocumentData>[]) {
  return [...docs].sort(
    (a, b) => createdAtMillis(b.data().createdAt) - createdAtMillis(a.data().createdAt),
  );
}

function defaultLoyalty(): LoyaltyFields {
  return { points_balance: 0, tier_level: "Bronze", lifetime_points: 0 };
}

function tierForLifetime(points: number): string {
  if (points >= 5000) return "Gold";
  if (points >= 2000) return "Silver";
  return "Bronze";
}

function mapClient(
  snap: QueryDocumentSnapshot<DocumentData>,
): Client {
  const d = snap.data() as ClientDoc;
  return {
    id: snap.id,
    name: d.name,
    company_name: d.company_name,
    email: d.email,
    phone_number: d.phone_number,
    whatsapp_number: d.whatsapp_number ?? null,
    account_type: d.account_type,
    brand_specs: d.brand_specs,
    it_infrastructure: d.it_infrastructure,
    marketing_opt_in: d.marketing_opt_in ?? false,
    source: d.source,
    pipeline_stage: d.pipeline_stage ?? "lead",
    created_at: tsToIso(d.createdAt),
    updated_at: tsToIso(d.updatedAt),
    loyalty_account: d.loyalty
      ? {
          points_balance: d.loyalty.points_balance,
          tier_level: d.loyalty.tier_level,
          lifetime_points: d.loyalty.lifetime_points,
        }
      : null,
  };
}

function mapLoyaltyAccount(snap: QueryDocumentSnapshot<DocumentData>): LoyaltyAccount {
  const client = mapClient(snap);
  return {
    id: client.id,
    client_id: client.id,
    points_balance: client.loyalty_account?.points_balance ?? 0,
    tier_level: client.loyalty_account?.tier_level ?? "Bronze",
    lifetime_points: client.loyalty_account?.lifetime_points ?? 0,
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      account_type: client.account_type,
    },
  };
}

function mapCommunicationLog(
  snap: QueryDocumentSnapshot<DocumentData>,
  clientMap?: Map<string, Client>,
): CommunicationLog {
  const d = snap.data();
  const clientId = d.clientId as string;
  const client = clientMap?.get(clientId);
  return {
    id: snap.id,
    client_id: clientId,
    channel: d.channel,
    status: d.status,
    recipient_address: d.recipient_address,
    message_body: d.message_body,
    provider_message_id: d.provider_message_id ?? null,
    created_at: tsToIso(d.createdAt) ?? new Date().toISOString(),
    client: client
      ? {
          id: client.id,
          name: client.name,
          email: client.email,
          company_name: client.company_name,
          account_type: client.account_type,
        }
      : undefined,
  };
}

function mapFeedback(snap: QueryDocumentSnapshot<DocumentData>): FeedbackSubmission {
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    surname: d.surname,
    email: d.email,
    feedback: d.feedback,
    source: d.source ?? "qr",
    firestore_id: d.qrSubmissionId ?? d.firestore_id ?? null,
    created_at: tsToIso(d.createdAt) ?? new Date().toISOString(),
  };
}

async function loadClientMap(ids: string[]): Promise<Map<string, Client>> {
  const map = new Map<string, Client>();
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return map;
  const db = getAdminFirestore();
  const snaps = await Promise.all(
    unique.map((id) => db.collection(COL.clients).doc(id).get()),
  );
  for (const snap of snaps) {
    if (snap.exists) map.set(snap.id, mapClient(snap as QueryDocumentSnapshot));
  }
  return map;
}

export async function listClients(limit = 500): Promise<PaginatedResponse<Client>> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COL.clients)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return { data: snap.docs.map((d) => mapClient(d)) };
}

export async function getClientById(id: string): Promise<ClientDetail | null> {
  const db = getAdminFirestore();
  const clientSnap = await db.collection(COL.clients).doc(id).get();
  if (!clientSnap.exists) return null;

  const client = mapClient(clientSnap as QueryDocumentSnapshot);
  const loyalty = client.loyalty_account ?? defaultLoyalty();
  const loyalty_account: LoyaltyAccountDetail = {
    id: client.id,
    client_id: client.id,
    points_balance: loyalty.points_balance,
    tier_level: loyalty.tier_level,
    lifetime_points: loyalty.lifetime_points,
  };

  const [logsSnap, feedbackSnap] = await Promise.all([
    db.collection(COL.communication_logs).where("clientId", "==", id).get(),
    db.collection(COL.feedback_submissions).where("clientId", "==", id).get(),
  ]);

  const communication_logs: CommunicationLogDetail[] = sortDocsByCreatedAtDesc(
    logsSnap.docs,
  )
    .slice(0, 100)
    .map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      client_id: id,
      channel: d.channel,
      status: d.status,
      recipient_address: d.recipient_address,
      message_body: d.message_body,
      provider_message_id: d.provider_message_id ?? null,
      sent_at: tsToIso(d.sentAt) ?? null,
      created_at: tsToIso(d.createdAt) ?? new Date().toISOString(),
    };
  });

  return {
    ...client,
    loyalty_account,
    communication_logs,
    feedback_submissions: sortDocsByCreatedAtDesc(feedbackSnap.docs)
      .slice(0, 50)
      .map((d) => mapFeedback(d)),
  };
}

export async function findClientByEmail(email: string): Promise<Client | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COL.clients)
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get();
  if (snap.empty) return null;
  return mapClient(snap.docs[0]!);
}

export async function createClient(input: {
  name: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  account_type: "retail" | "corporate";
  company_name?: string;
  marketing_opt_in?: boolean;
  source?: string;
}): Promise<{ id: string }> {
  const email = input.email.toLowerCase().trim();
  const existing = await findClientByEmail(email);
  if (existing) {
    throw new Error("A client with this email already exists.");
  }

  const whatsapp = formatZwWhatsApp(input.whatsapp_number);
  if (!whatsapp) {
    throw new Error("Invalid WhatsApp number (use +263 without leading 0).");
  }

  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    name: input.name.trim(),
    company_name: input.company_name?.trim() || null,
    email,
    phone_number: input.phone_number.trim(),
    whatsapp_number: whatsapp,
    account_type: input.account_type,
    brand_specs: null,
    it_infrastructure: null,
    marketing_opt_in: input.marketing_opt_in ?? false,
    source: input.source ?? null,
    pipeline_stage: "lead",
    createdAt: now,
    updatedAt: now,
  });

  return { id: ref.id };
}

export async function updateClient(
  id: string,
  input: Record<string, unknown>,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Client not found");

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  const allowed = [
    "name",
    "company_name",
    "email",
    "phone_number",
    "whatsapp_number",
    "account_type",
    "brand_specs",
    "it_infrastructure",
    "marketing_opt_in",
    "pipeline_stage",
    "source",
  ] as const;

  for (const key of allowed) {
    if (key in input) {
      if (key === "email" && typeof input.email === "string") {
        patch.email = input.email.toLowerCase().trim();
      } else if (key === "whatsapp_number") {
        const raw = input.whatsapp_number;
        if (raw === null || raw === "" || raw === undefined) {
          patch.whatsapp_number = null;
        } else if (typeof raw === "string") {
          const formatted = formatZwWhatsApp(raw);
          if (!formatted) throw new Error("Invalid WhatsApp number (use +263 without leading 0).");
          patch.whatsapp_number = formatted;
        }
      } else {
        patch[key] = input[key];
      }
    }
  }

  if (typeof patch.email === "string") {
    const other = await findClientByEmail(patch.email);
    if (other && other.id !== id) {
      throw new Error("Another client already uses this email.");
    }
  }

  await ref.update(patch);
}

export async function deleteClient(id: string): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();
  const clientRef = db.collection(COL.clients).doc(id);
  batch.delete(clientRef);

  const [logs, feedback] = await Promise.all([
    db.collection(COL.communication_logs).where("clientId", "==", id).get(),
    db.collection(COL.feedback_submissions).where("clientId", "==", id).get(),
  ]);

  for (const doc of logs.docs) batch.delete(doc.ref);
  for (const doc of feedback.docs) batch.delete(doc.ref);

  await batch.commit();
}

export async function createCommunicationLog(input: {
  client_id: string;
  channel: "email" | "sms" | "whatsapp";
  recipient_address: string;
  message_body: string;
  status?: CommunicationLog["status"];
  provider_message_id?: string;
}): Promise<string> {
  const db = getAdminFirestore();
  const ref = await db.collection(COL.communication_logs).add({
    clientId: input.client_id,
    channel: input.channel,
    recipient_address: input.recipient_address,
    message_body: input.message_body,
    status: input.status ?? "queued",
    provider_message_id: input.provider_message_id ?? null,
    sentAt: null,
    error_telemetry: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateCommunicationLog(
  logId: string,
  patch: {
    status?: CommunicationLog["status"];
    provider_message_id?: string;
    error_telemetry?: string | null;
  },
): Promise<void> {
  const db = getAdminFirestore();
  const data: Record<string, unknown> = {};
  if (patch.status) {
    data.status = patch.status;
    if (patch.status === "sent") {
      data.sentAt = FieldValue.serverTimestamp();
    }
  }
  if (patch.provider_message_id !== undefined) {
    data.provider_message_id = patch.provider_message_id;
  }
  if (patch.error_telemetry !== undefined) {
    data.error_telemetry = patch.error_telemetry;
  }
  await db.collection(COL.communication_logs).doc(logId).update(data);
}

export async function listCommunicationLogs(filters?: {
  status?: string;
  channel?: string;
}): Promise<PaginatedResponse<CommunicationLog>> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COL.communication_logs)
    .orderBy("createdAt", "desc")
    .limit(500)
    .get();
  const clientIds = snap.docs.map((d) => d.data().clientId as string);
  const clientMap = await loadClientMap(clientIds);

  let data = snap.docs.map((d) => mapCommunicationLog(d, clientMap));
  if (filters?.channel) {
    data = data.filter((l) => l.channel === filters.channel);
  }
  if (filters?.status) {
    data = data.filter((l) => l.status === filters.status);
  }

  return { data };
}

export async function enrollLoyaltyMember(clientId: string): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Client not found");
  const data = snap.data() as ClientDoc;
  if (data.loyalty) throw new Error("Already on the loyalty ledger.");
  await ref.update({
    loyalty: defaultLoyalty(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function removeLoyaltyMember(clientId: string): Promise<LoyaltyFields> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Client not found");
  const data = snap.data() as ClientDoc;
  if (!data.loyalty) throw new Error("Not on the loyalty ledger.");
  const snapshot = { ...data.loyalty };
  await ref.update({
    loyalty: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return snapshot;
}

export async function restoreLoyaltyMember(
  clientId: string,
  loyalty: LoyaltyFields,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Client not found");
  await ref.update({
    loyalty,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function addPointsBack(
  clientId: string,
  points: number,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Client not found");
    const data = snap.data() as ClientDoc;
    if (!data.loyalty) throw new Error("Client is not on the loyalty ledger.");
    const loyalty = data.loyalty;
    tx.update(ref, {
      loyalty: {
        ...loyalty,
        points_balance: loyalty.points_balance + points,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function listLoyaltyAccounts(): Promise<PaginatedResponse<LoyaltyAccount>> {
  const clients = await listClients(500);
  return {
    data: clients.data
      .filter((c) => c.loyalty_account != null)
      .map((c) => ({
        id: c.id,
        client_id: c.id,
        points_balance: c.loyalty_account!.points_balance,
        tier_level: c.loyalty_account!.tier_level,
        lifetime_points: c.loyalty_account!.lifetime_points,
        client: {
          id: c.id,
          name: c.name,
          email: c.email,
          account_type: c.account_type,
        },
      })),
  };
}

export async function awardPoints(
  clientId: string,
  transactionAmount: number,
  marginCoefficient: number,
): Promise<number> {
  const points = Math.round(transactionAmount * marginCoefficient);
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Client not found");
    const data = snap.data() as ClientDoc;
    if (!data.loyalty) {
      throw new Error("Client is not on the loyalty ledger.");
    }
    const loyalty = data.loyalty;
    const lifetime = loyalty.lifetime_points + points;
    tx.update(ref, {
      loyalty: {
        points_balance: loyalty.points_balance + points,
        lifetime_points: lifetime,
        tier_level: tierForLifetime(lifetime),
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return points;
}

export async function redeemPoints(
  clientId: string,
  points: number,
  _rewardLabel?: string,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.clients).doc(clientId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Client not found");
    const data = snap.data() as ClientDoc;
    if (!data.loyalty) {
      throw new Error("Client is not on the loyalty ledger.");
    }
    const loyalty = data.loyalty;
    if (loyalty.points_balance < points) {
      throw new Error("Insufficient points");
    }
    tx.update(ref, {
      loyalty: {
        ...loyalty,
        points_balance: loyalty.points_balance - points,
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function listFeedbackSubmissions(): Promise<
  PaginatedResponse<FeedbackSubmission>
> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COL.feedback_submissions)
    .orderBy("createdAt", "desc")
    .limit(500)
    .get();
  return { data: snap.docs.map((d) => mapFeedback(d)) };
}

export async function getSettings(): Promise<AppSettings> {
  const db = getAdminFirestore();
  const ref = db.collection(COL.settings).doc(SETTINGS_DOC);
  const snap = await ref.get();
  if (!snap.exists) {
    const defaults: AppSettings = {
      default_margin_coefficient: 0.1,
      weekly_updates_enabled: true,
    };
    await ref.set({ ...defaults, updatedAt: FieldValue.serverTimestamp() });
    return defaults;
  }
  const d = snap.data()!;
  return {
    default_margin_coefficient: Number(d.default_margin_coefficient ?? 0.1),
    weekly_updates_enabled: Boolean(d.weekly_updates_enabled ?? true),
  };
}

export async function updateSettings(input: Partial<AppSettings>): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection(COL.settings)
    .doc(SETTINGS_DOC)
    .set(
      { ...input, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

export async function ingestQrSubmission(data: {
  name: string;
  surname: string;
  email: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  feedback: string;
  qrSubmissionId?: string;
}): Promise<{ clientId: string; created: boolean }> {
  const email = data.email.toLowerCase().trim();
  const fullName = `${data.name.trim()} ${data.surname.trim()}`.trim();
  const whatsapp = data.whatsapp_number?.trim() || null;
  const phone =
    whatsapp || (data.phone_number?.trim() && data.phone_number !== "N/A"
      ? data.phone_number.trim()
      : "N/A");

  if (data.qrSubmissionId) {
    const db = getAdminFirestore();
    const dup = await db
      .collection(COL.feedback_submissions)
      .where("qrSubmissionId", "==", data.qrSubmissionId)
      .limit(1)
      .get();
    if (!dup.empty) {
      const clientId = dup.docs[0]!.data().clientId as string;
      return { clientId, created: false };
    }
  }

  let client = await findClientByEmail(email);
  let created = false;

  if (!client) {
    const waForCreate =
      whatsapp ?? (phone !== "N/A" ? formatZwWhatsApp(phone) : null);
    if (!waForCreate) {
      throw new Error("WhatsApp number is required for QR sign-up.");
    }
    const { id } = await createClient({
      name: fullName,
      email,
      phone_number: phone === "N/A" && waForCreate ? waForCreate : phone,
      whatsapp_number: waForCreate,
      account_type: "retail",
      marketing_opt_in: true,
      source: "qr",
    });
    client = (await getClientById(id))!;
    created = true;
  } else {
    const db = getAdminFirestore();
    const patch: Record<string, unknown> = {
      name: fullName,
      marketing_opt_in: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (phone !== "N/A") patch.phone_number = phone;
    if (whatsapp) patch.whatsapp_number = whatsapp;
    if (!client.source) patch.source = "qr";
    await db.collection(COL.clients).doc(client.id).update(patch);
  }

  const db = getAdminFirestore();
  await db.collection(COL.feedback_submissions).add({
    clientId: client.id,
    name: data.name.trim(),
    surname: data.surname.trim(),
    email,
    feedback: data.feedback.trim(),
    source: "qr",
    qrSubmissionId: data.qrSubmissionId ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { clientId: client.id, created };
}

export async function syncQrSubmissionsFromFirestore(): Promise<number> {
  const db = getAdminFirestore();
  const snap = await db.collection(COL.qr_submissions).limit(50).get();

  let synced = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    if (d.syncedToCrm === true || d.syncedToLaravel === true) continue;
    if (!d.email || !d.name || !d.surname || !d.feedback) continue;

    try {
      await ingestQrSubmission({
        name: String(d.name),
        surname: String(d.surname),
        email: String(d.email),
        phone_number: d.phone_number ? String(d.phone_number) : null,
        whatsapp_number: d.whatsapp_number
          ? String(d.whatsapp_number)
          : d.phone_number
            ? String(d.phone_number)
            : null,
        feedback: String(d.feedback),
        qrSubmissionId: doc.id,
      });
      await doc.ref.update({
        syncedToCrm: true,
        syncedAt: FieldValue.serverTimestamp(),
      });
      synced++;
    } catch {
      // skip failed row
    }
  }
  return synced;
}
