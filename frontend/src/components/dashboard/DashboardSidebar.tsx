"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiX } from "react-icons/fi";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LinkPulseLogo } from "@/components/brand/LinkPulseLogo";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";
import { crmNavigation, type NavItem } from "@/config/crm-navigation";

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        "flex min-w-0 items-center justify-between gap-2 rounded-2xl px-3 py-2 text-sm transition",
        active
          ? "bg-white font-medium text-zinc-900 shadow-sm"
          : "text-zinc-500 hover:bg-white/60 hover:text-zinc-800",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-2">
        <item.Icon className="h-4 w-4 shrink-0 opacity-70" />
        <span className="truncate">{item.label}</span>
      </span>
      {item.status === "live" ? null : (
        <span className="shrink-0 rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-500">
          soon
        </span>
      )}
    </Link>
  );
}

type DashboardSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function DashboardSidebar({
  className = "",
  onNavigate,
}: DashboardSidebarProps) {
  const { closeNav, navOpen } = useDashboardShell();

  return (
    <aside
      className={[
        "min-h-0 shrink-0 flex-col border-r border-zinc-200/80 bg-[#f3f4f6] px-3 py-4 sm:px-4 sm:py-5",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-1 py-1"
        >
          <LinkPulseLogo variant="full" className="max-w-[140px] sm:max-w-[168px]" />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeNav}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-white lg:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>
        <FiChevronDown className="hidden shrink-0 text-zinc-400 lg:block" />
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain pr-1 sm:space-y-5">
        {crmNavigation.map((section) => (
          <div key={section.id} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-3 space-y-2">
        <SignOutButton />
        {!navOpen ? (
          <p className="hidden px-3 text-[10px] leading-relaxed text-zinc-400 lg:block">
            Acquire → Manage → Engage → Reward → Deliver
          </p>
        ) : null}
      </div>
    </aside>
  );
}
