"use server";

import { requireStaffAction } from "@/lib/auth/require-staff-action";
import { revalidatePath } from "next/cache";
import { logAndDeliverMessage } from "@/lib/email-delivery";
import { isBrevoConfigured } from "@/lib/brevo";
import {
  awardPoints,
  createClient,
  deleteClient,
  getClientById,
  updateClient,
} from "@/lib/firestore/crm";
import type { HistoryPair } from "@/lib/undo-types";
import type { Client } from "@/lib/api";

function reverseClientPatch(
  before: Client,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const reverse: Record<string, unknown> = {};
  for (const key of Object.keys(input)) {
    if (key === "pipeline_stage") {
      reverse.pipeline_stage = before.pipeline_stage ?? "lead";
    } else if (key === "name") reverse.name = before.name;
    else if (key === "email") reverse.email = before.email;
    else if (key === "phone_number") reverse.phone_number = before.phone_number;
    else if (key === "whatsapp_number") {
      reverse.whatsapp_number = before.whatsapp_number;
    } else if (key === "company_name") {
      reverse.company_name = before.company_name;
    } else if (key === "account_type") reverse.account_type = before.account_type;
    else if (key === "marketing_opt_in") {
      reverse.marketing_opt_in = before.marketing_opt_in;
    } else if (key === "brand_specs") reverse.brand_specs = before.brand_specs;
    else if (key === "it_infrastructure") {
      reverse.it_infrastructure = before.it_infrastructure;
    }
  }
  return reverse;
}

function revalidateClientPaths(id?: string) {
  revalidatePath("/contacts");
  revalidatePath("/companies");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
  revalidatePath("/analytics");
  revalidatePath("/loyalty");
  revalidatePath("/communications");
  revalidatePath("/campaigns");
  revalidatePath("/feedback");
  if (id) {
    revalidatePath(`/contacts/${id}`);
    revalidatePath(`/companies/${id}`);
  }
}

export async function createClientAction(input: {
  name: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  account_type: "retail" | "corporate";
  company_name?: string;
}) {
  try {
    await requireStaffAction();
    const data = await createClient(input);
    revalidateClientPaths(data.id);
    const history: HistoryPair = {
      label: "Created contact",
      undo: { type: "delete_client", clientId: data.id },
      redo: { type: "create_client", input },
    };
    return { ok: true as const, data, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not create client.",
    };
  }
}

export async function updateClientAction(
  id: string,
  input: Record<string, unknown>,
) {
  try {
    await requireStaffAction();
    const before = await getClientById(id);
    if (!before) throw new Error("Client not found");
    await updateClient(id, input);
    revalidateClientPaths(id);
    const reverse = reverseClientPatch(before, input);
    const history: HistoryPair = {
      label: "Updated contact",
      undo: { type: "update_client", clientId: id, patch: reverse },
      redo: { type: "update_client", clientId: id, patch: input },
    };
    return { ok: true as const, data: { id }, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not update client.",
    };
  }
}

export async function updatePipelineStageAction(
  id: string,
  pipeline_stage: "lead" | "quote" | "won" | "production",
) {
  await requireStaffAction();
  const before = await getClientById(id);
  if (!before) {
    return { ok: false as const, error: "Client not found" };
  }
  const prev = before.pipeline_stage ?? "lead";
  try {
    await updateClient(id, { pipeline_stage });
    revalidateClientPaths(id);
    const history: HistoryPair = {
      label: `Pipeline → ${pipeline_stage}`,
      undo: {
        type: "update_client",
        clientId: id,
        patch: { pipeline_stage: prev },
      },
      redo: {
        type: "update_client",
        clientId: id,
        patch: { pipeline_stage },
      },
    };
    return { ok: true as const, data: { id }, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not update stage.",
    };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await requireStaffAction();
    await deleteClient(id);
    revalidateClientPaths();
    return { ok: true as const, data: { message: "Client deleted" } };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not delete client.",
    };
  }
}

export async function sendMessageAction(input: {
  client_id: string;
  channel: "email" | "sms" | "whatsapp";
  recipient_address: string;
  message_body: string;
}) {
  try {
    await requireStaffAction();
    const client = await getClientById(input.client_id);
    const result = await logAndDeliverMessage({
      ...input,
      recipient_name: client?.name,
    });
    revalidateClientPaths(input.client_id);
    if (result.status === "failed") {
      return { ok: false as const, error: result.error ?? "Email send failed." };
    }
    const note =
      input.channel === "email" && isBrevoConfigured()
        ? result.status === "sent"
          ? "Email sent via Brevo."
          : "Logged (Brevo not configured)."
        : "Message logged.";
    return { ok: true as const, data: { status: result.status, message: note } };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not log message.",
    };
  }
}

export async function awardPointsAction(
  clientId: string,
  transactionAmount: number,
  marginCoefficient: number,
) {
  try {
    await requireStaffAction();
    const points = await awardPoints(
      clientId,
      transactionAmount,
      marginCoefficient,
    );
    revalidateClientPaths(clientId);
    const history: HistoryPair = {
      label: `Awarded ${points} points`,
      undo: { type: "redeem_points", clientId, points },
      redo: {
        type: "award_points",
        clientId,
        points,
        transactionAmount,
        marginCoefficient,
      },
    };
    return { ok: true as const, data: { awarded_points: points }, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not award points.",
    };
  }
}
