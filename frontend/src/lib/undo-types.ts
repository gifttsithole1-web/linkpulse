/** Serializable CRM undo/redo steps (session history). */

export type LoyaltySnapshot = {
  points_balance: number;
  tier_level: string;
  lifetime_points: number;
};

export type UndoRecord =
  | { type: "enroll_loyalty"; clientId: string }
  | { type: "remove_loyalty"; clientId: string }
  | {
      type: "restore_loyalty";
      clientId: string;
      loyalty: LoyaltySnapshot;
    }
  | {
      type: "award_points";
      clientId: string;
      points: number;
      transactionAmount: number;
      marginCoefficient: number;
    }
  | { type: "redeem_points"; clientId: string; points: number }
  | { type: "restore_points"; clientId: string; points: number }
  | {
      type: "update_client";
      clientId: string;
      patch: Record<string, unknown>;
    }
  | { type: "delete_client"; clientId: string }
  | {
      type: "create_client";
      input: {
        name: string;
        email: string;
        phone_number: string;
        whatsapp_number: string;
        account_type: "retail" | "corporate";
        company_name?: string;
      };
    };

export type HistoryPair = {
  label: string;
  undo: UndoRecord;
  redo: UndoRecord;
};
