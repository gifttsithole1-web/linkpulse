"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPulseLogo } from "@/components/brand/LinkPulseLogo";
import { iconRailItems } from "@/config/crm-navigation";

export function IconRail() {
  const pathname = usePathname();

  return (
    <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-zinc-200/80 bg-white py-4 lg:flex xl:w-[56px] xl:gap-3 xl:py-5">
      <Link href="/dashboard" title="LinkPulse" className="shrink-0">
        <LinkPulseLogo variant="mark" />
      </Link>
      {iconRailItems.map(({ href, Icon, label }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={label}
            href={href}
            title={label}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-2xl transition xl:h-10 xl:w-10",
              active
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </Link>
        );
      })}
    </div>
  );
}
