"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-zinc-200 text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-zinc-400" />
      {label}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <>
      <div className="mt-6 space-y-1">
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/contacts" label="Contacts" />
        <NavItem href="/notifications" label="Notifications" />
        <NavItem href="/tasks" label="Tasks" />
        <NavItem href="/emails" label="Emails" />
        <NavItem href="/calendar" label="Calendar" />
      </div>

      <div className="mt-8 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Database
      </div>
      <div className="mt-2 space-y-1">
        <NavItem href="/analytics" label="Analytics" />
        <NavItem href="/companies" label="Companies" />
      </div>

      <div className="mt-8 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        System
      </div>
      <div className="mt-2 space-y-1">
        <NavItem href="/integrations" label="Integrations" />
        <NavItem href="/settings" label="Settings" />
      </div>
    </>
  );
}

