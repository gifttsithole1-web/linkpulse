"use server";

import { revalidatePath } from "next/cache";
import {
  enrollLoyaltyMember,
  removeLoyaltyMember,
} from "@/lib/firestore/crm";
import type { HistoryPair } from "@/lib/undo-types";

function revalidateLoyalty(clientId?: string) {
  revalidatePath("/loyalty");
  revalidatePath("/loyalty/redemptions");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/contacts");
  revalidatePath("/companies");
  if (clientId) {
    revalidatePath(`/contacts/${clientId}`);
    revalidatePath(`/companies/${clientId}`);
  }
}

export async function addLoyaltyMemberAction(clientId: string) {
  try {
    await enrollLoyaltyMember(clientId);
    revalidateLoyalty(clientId);
    const history: HistoryPair = {
      label: "Added to loyalty",
      undo: { type: "remove_loyalty", clientId },
      redo: { type: "enroll_loyalty", clientId },
    };
    return { ok: true as const, data: { clientId }, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not add member.",
    };
  }
}

export async function removeLoyaltyMemberAction(clientId: string) {
  try {
    const loyalty = await removeLoyaltyMember(clientId);
    revalidateLoyalty(clientId);
    const history: HistoryPair = {
      label: "Removed from loyalty",
      undo: { type: "restore_loyalty", clientId, loyalty },
      redo: { type: "remove_loyalty", clientId },
    };
    return { ok: true as const, data: { clientId }, history };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not remove member.",
    };
  }
}
