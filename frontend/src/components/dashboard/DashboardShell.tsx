"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { UndoRedoProvider } from "@/components/undo/UndoRedoProvider";
import { IconRail } from "./IconRail";
import { DashboardSidebar } from "./DashboardSidebar";

type ShellContextValue = {
  toggleNav: () => void;
  closeNav: () => void;
  navOpen: boolean;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function useDashboardShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useDashboardShell must be used within DashboardShell");
  }
  return ctx;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = useCallback(() => setNavOpen((o) => !o), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <ShellContext.Provider value={{ toggleNav, closeNav, navOpen }}>
      <UndoRedoProvider>
      <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[var(--dash-bg)] text-zinc-900">
        <IconRail />
        {navOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={closeNav}
          />
        ) : null}
        <DashboardSidebar
          className={
            navOpen
              ? "fixed inset-y-0 left-0 z-50 flex h-full w-[min(100vw,280px)] shadow-2xl lg:static lg:z-auto lg:w-[248px] lg:shadow-none"
              : "hidden lg:flex"
          }
          onNavigate={closeNav}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
      </UndoRedoProvider>
    </ShellContext.Provider>
  );
}
