"use server";

import { requireStaffAction } from "@/lib/auth/require-staff-action";
import { revalidatePath } from "next/cache";
import { applyHistoryRecord } from "@/lib/undo-apply";
import type { UndoRecord } from "@/lib/undo-types";

function revalidateAll(clientId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/contacts");
  revalidatePath("/companies");
  revalidatePath("/loyalty");
  revalidatePath("/loyalty/redemptions");
  revalidatePath("/pipeline");
  revalidatePath("/analytics");
  revalidatePath("/communications");
  revalidatePath("/campaigns");
  if (clientId) {
    revalidatePath(`/contacts/${clientId}`);
    revalidatePath(`/companies/${clientId}`);
  }
}

export async function applyHistoryRecordAction(record: UndoRecord) {
  try {
    await requireStaffAction();
    await applyHistoryRecord(record);
    revalidateAll(
      "clientId" in record ? (record.clientId as string) : undefined,
    );
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Could not apply action.",
    };
  }
}
