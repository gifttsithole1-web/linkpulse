"use client";

import { FiCornerDownLeft, FiCornerUpLeft } from "react-icons/fi";
import { useUndoRedoOptional } from "@/components/undo/UndoRedoProvider";

export function UndoRedoToolbar() {
  const ctx = useUndoRedoOptional();
  if (!ctx) return null;

  const { canUndo, canRedo, undoLabel, redoLabel, pending, undo, redo } = ctx;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-white p-1 shadow-sm">
      <button
        type="button"
        title={undoLabel ? `Undo: ${undoLabel}` : "Undo"}
        aria-label="Undo"
        disabled={!canUndo}
        onClick={() => void undo()}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <FiCornerUpLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        title={redoLabel ? `Redo: ${redoLabel}` : "Redo"}
        aria-label="Redo"
        disabled={!canRedo}
        onClick={() => void redo()}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <FiCornerDownLeft className="h-4 w-4" />
      </button>
      {pending ? (
        <span className="hidden pr-2 text-[10px] text-zinc-400 sm:inline">…</span>
      ) : null}
    </div>
  );
}
