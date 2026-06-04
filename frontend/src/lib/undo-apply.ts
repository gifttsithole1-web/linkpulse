import {
  addPointsBack,
  awardPoints,
  createClient,
  deleteClient,
  enrollLoyaltyMember,
  redeemPoints,
  removeLoyaltyMember,
  restoreLoyaltyMember,
  updateClient,
} from "@/lib/firestore/crm";
import type { UndoRecord } from "@/lib/undo-types";

export async function applyHistoryRecord(record: UndoRecord): Promise<void> {
  switch (record.type) {
    case "restore_points":
      await addPointsBack(record.clientId, record.points);
      break;
    case "enroll_loyalty":
      await enrollLoyaltyMember(record.clientId);
      break;
    case "remove_loyalty":
      await removeLoyaltyMember(record.clientId);
      break;
    case "restore_loyalty":
      await restoreLoyaltyMember(record.clientId, record.loyalty);
      break;
    case "award_points":
      await awardPoints(
        record.clientId,
        record.transactionAmount,
        record.marginCoefficient,
      );
      break;
    case "redeem_points":
      await redeemPoints(record.clientId, record.points);
      break;
    case "update_client":
      await updateClient(record.clientId, record.patch);
      break;
    case "delete_client":
      await deleteClient(record.clientId);
      break;
    case "create_client":
      await createClient(record.input);
      break;
    default: {
      const _exhaustive: never = record;
      throw new Error(`Unknown history record`);
    }
  }
}
