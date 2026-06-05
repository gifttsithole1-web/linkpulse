"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { logoutStaffAction } from "@/lib/actions/auth";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await logoutStaffAction();
      router.replace("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={pending}
      className={[
        "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-zinc-500 transition hover:bg-white/60 hover:text-zinc-800 disabled:opacity-50",
        className,
      ].join(" ")}
    >
      <FiLogOut className="h-4 w-4 shrink-0" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
