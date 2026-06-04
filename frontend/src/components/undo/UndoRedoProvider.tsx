"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { applyHistoryRecordAction } from "@/lib/actions/undo";
import { notifyDashboardRefresh } from "@/hooks/useDashboardStats";
import type { HistoryPair } from "@/lib/undo-types";

type UndoRedoContextValue = {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  pending: boolean;
  pushHistory: (pair: HistoryPair) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

export function useUndoRedo() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) {
    throw new Error("useUndoRedo must be used within UndoRedoProvider");
  }
  return ctx;
}

export function useUndoRedoOptional() {
  return useContext(UndoRedoContext);
}

export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [undoStack, setUndoStack] = useState<HistoryPair[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryPair[]>([]);
  const [pending, setPending] = useState(false);

  const pushHistory = useCallback((pair: HistoryPair) => {
    setUndoStack((s) => [...s.slice(-49), pair]);
    setRedoStack([]);
  }, []);

  const run = useCallback(
    async (record: HistoryPair["undo"] | HistoryPair["redo"]) => {
      setPending(true);
      try {
        const result = await applyHistoryRecordAction(record);
        if (!result.ok) {
          window.alert(result.error);
          return false;
        }
        router.refresh();
        notifyDashboardRefresh();
        return true;
      } finally {
        setPending(false);
      }
    },
    [router],
  );

  const undo = useCallback(async () => {
    const item = undoStack[undoStack.length - 1];
    if (!item || pending) return;
    const ok = await run(item.undo);
    if (ok) {
      setUndoStack((s) => s.slice(0, -1));
      setRedoStack((r) => [...r, item]);
    }
  }, [undoStack, pending, run]);

  const redo = useCallback(async () => {
    const item = redoStack[redoStack.length - 1];
    if (!item || pending) return;
    const ok = await run(item.redo);
    if (ok) {
      setRedoStack((r) => r.slice(0, -1));
      setUndoStack((s) => [...s, item]);
    }
  }, [redoStack, pending, run]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        void undo();
      } else if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        void redo();
      } else if (e.key === "y" && !e.shiftKey) {
        e.preventDefault();
        void redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const topUndo = undoStack[undoStack.length - 1];
  const topRedo = redoStack[redoStack.length - 1];

  return (
    <UndoRedoContext.Provider
      value={{
        canUndo: undoStack.length > 0 && !pending,
        canRedo: redoStack.length > 0 && !pending,
        undoLabel: topUndo?.label ?? null,
        redoLabel: topRedo?.label ?? null,
        pending,
        pushHistory,
        undo,
        redo,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}
