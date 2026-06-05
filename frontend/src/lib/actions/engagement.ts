"use server";

import { requireStaffAction } from "@/lib/auth/require-staff-action";
import { revalidatePath } from "next/cache";
import { assertWithinBrevoDailyCap, isBrevoConfigured } from "@/lib/brevo";
import { deliverEmailBatch, logAndDeliverMessage } from "@/lib/email-delivery";
import type { Client } from "@/lib/api";
import {
  createCommunicationLog,
  listClients,
  redeemPoints,
  updateSettings,
} from "@/lib/firestore/crm";
import type { HistoryPair } from "@/lib/undo-types";

function recipientForChannel(
  client: Client,
  channel: "email" | "sms" | "whatsapp",
): string {
  if (channel === "email") return client.email;
  if (channel === "whatsapp") {
    return client.whatsapp_number ?? client.phone_number;
  }
  return client.phone_number;
}

export async function launchCampaignAction(input: {
  name: string;
  channel: "email" | "sms" | "whatsapp";
  message_body: string;
  audience: "all" | "opt_in" | "retail" | "corporate";
}) {
  try {
    await requireStaffAction();
    const { data: allClients } = await listClients(500);
    let clients = allClients;

    if (input.audience === "opt_in") {
      clients = clients.filter((c) => c.marketing_opt_in);
    } else if (input.audience === "retail") {
      clients = clients.filter((c) => c.account_type === "retail");
    } else if (input.audience === "corporate") {
      clients = clients.filter((c) => c.account_type === "corporate");
    }

    const campaignId = `campaign-${Date.now()}`;
    const message_body = input.message_body.trim();
    const campaignSubject = input.name.trim() || "Update from Beamlink";

    if (input.channel === "email") {
      assertWithinBrevoDailyCap(clients.length);
      const stats = await deliverEmailBatch(
        clients
          .filter((c) => c.email)
          .map((c) => ({
            client_id: c.id,
            email: c.email,
            name: c.name,
            message_body,
            provider_message_id: campaignId,
          })),
        { subject: campaignSubject, emailStyle: "newsletter" },
      );

      revalidatePath("/campaigns");
      revalidatePath("/communications");
      revalidatePath("/dashboard");

      return {
        ok: true as const,
        data: {
          sent: stats.sent,
          failed: stats.failed,
          queued: stats.queued,
          total: clients.length,
          campaignId,
          viaBrevo: isBrevoConfigured(),
        },
      };
    }

    for (const client of clients) {
      await createCommunicationLog({
        client_id: client.id,
        channel: input.channel,
        recipient_address: recipientForChannel(client, input.channel),
        message_body,
        status: "queued",
        provider_message_id: campaignId,
      });
    }

    revalidatePath("/campaigns");
    revalidatePath("/communications");
    revalidatePath("/dashboard");

    return {
      ok: true as const,
      data: {
        sent: clients.length,
        failed: 0,
        queued: clients.length,
        total: clients.length,
        campaignId,
        viaBrevo: false,
      },
    };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Campaign failed.",
    };
  }
}

export async function updateSettingsAction(input: {
  default_margin_coefficient?: number;
}) {
  try {
    await requireStaffAction();
    await updateSettings(input);
    revalidatePath("/settings");
    revalidatePath("/loyalty");
    return { ok: true as const, data: {} };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not save settings.",
    };
  }
}

export async function redeemPointsAction(
  clientId: string,
  points: number,
  rewardLabel: string,
) {
  try {
    await requireStaffAction();
    await redeemPoints(clientId, points, rewardLabel);
    revalidatePath("/loyalty");
    revalidatePath("/loyalty/redemptions");
    const history: HistoryPair = {
      label: `Redeemed ${rewardLabel}`,
      undo: { type: "restore_points", clientId, points },
      redo: { type: "redeem_points", clientId, points },
    };
    return { ok: true as const, data: {}, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Redemption failed.",
    };
  }
}
