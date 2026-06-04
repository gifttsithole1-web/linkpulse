"use client";

import { useCallback } from "react";
import { useUndoRedo } from "@/components/undo/UndoRedoProvider";
import { applyResultHistory } from "@/lib/push-history";
import type { HistoryPair } from "@/lib/undo-types";

export function useActionHistory() {
  const { pushHistory } = useUndoRedo();

  return useCallback(
    (result: { ok: boolean; history?: HistoryPair; error?: string }) => {
      if (result.ok && result.history) {
        applyResultHistory(pushHistory, {
          ok: true,
          history: result.history,
        });
      }
    },
    [pushHistory],
  );
}
