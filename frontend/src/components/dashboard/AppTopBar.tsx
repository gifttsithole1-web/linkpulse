"use client";

import { FiMenu, FiSearch } from "react-icons/fi";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";
import { UndoRedoToolbar } from "@/components/undo/UndoRedoToolbar";

type AppTopBarProps = {
  /** Optional search form (dashboard supplies its own header when set) */
  showPlaceholderSearch?: boolean;
};

export function AppTopBar({ showPlaceholderSearch = true }: AppTopBarProps) {
  const { toggleNav } = useDashboardShell();

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-zinc-200/60 bg-[var(--dash-bg)] px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
      {showPlaceholderSearch ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:rounded-[20px] sm:px-4 sm:py-3">
          <FiSearch className="h-5 w-5 shrink-0 text-zinc-400" />
          <span className="truncate text-sm text-zinc-400">Search…</span>
        </div>
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <UndoRedoToolbar />
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={toggleNav}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-600 shadow-sm lg:hidden"
      >
        <FiMenu className="h-5 w-5" />
      </button>
    </header>
  );
}
