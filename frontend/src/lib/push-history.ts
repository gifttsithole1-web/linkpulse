import type { HistoryPair } from "@/lib/undo-types";

export type ActionResultWithHistory =
  | { ok: true; history?: HistoryPair }
  | { ok: false; error: string };

export function applyResultHistory(
  pushHistory: (pair: HistoryPair) => void,
  result: ActionResultWithHistory,
) {
  if (result.ok && result.history) {
    pushHistory(result.history);
  }
}
