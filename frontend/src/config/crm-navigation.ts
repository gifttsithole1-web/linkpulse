import type { IconType } from "react-icons";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiGift,
  FiGrid,
  FiLayers,
  FiLink,
  FiMessageSquare,
  FiSend,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

export type NavItem = {
  label: string;
  href: string;
  description: string;
  Icon: IconType;
  badge?: number;
  status?: "live" | "beta" | "planned";
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

/**
 * LinkPulse CRM information architecture
 *
 * Flow: Acquire → Manage → Engage → Reward → Deliver → Measure
 */
export const crmNavigation: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "KPIs, funnel health, and quick actions.",
        Icon: FiGrid,
        status: "live",
      },
      {
        label: "Analytics",
        href: "/analytics",
        description: "Trends across clients, revenue, and engagement.",
        Icon: FiBarChart2,
        status: "live",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients & sales",
    items: [
      {
        label: "Contacts",
        href: "/contacts",
        description: "All clients — retail and corporate profiles.",
        Icon: FiUsers,
        status: "live",
      },
      {
        label: "Companies",
        href: "/companies",
        description: "Corporate accounts, contracts, and IT context.",
        Icon: FiBriefcase,
        status: "live",
      },
      {
        label: "Pipeline",
        href: "/pipeline",
        description: "Deals, quotes, and stage tracking.",
        Icon: FiTrendingUp,
        status: "live",
      },
    ],
  },
  {
    id: "acquisition",
    label: "Acquisition",
    items: [
      {
        label: "QR & landing",
        href: "/acquisition/qr",
        description: "QR code, landing page, and scan funnel.",
        Icon: FiLink,
        status: "live",
      },
      {
        label: "Feedback inbox",
        href: "/feedback",
        description: "Submissions synced from Firestore.",
        Icon: FiMessageSquare,
        status: "live",
      },
      {
        label: "Sync center",
        href: "/acquisition/sync",
        description: "QR buffer → Firestore CRM ingest.",
        Icon: FiZap,
        status: "live",
      },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    items: [
      {
        label: "Campaigns",
        href: "/campaigns",
        description: "Bulk email/SMS/WhatsApp campaigns.",
        Icon: FiSend,
        status: "live",
      },
      {
        label: "Communications",
        href: "/communications",
        description: "Delivery logs and channel telemetry.",
        Icon: FiBookOpen,
        status: "live",
      },
      {
        label: "Automations",
        href: "/automations",
        description: "48h cascade and reminder workflows.",
        Icon: FiLayers,
        status: "live",
      },
    ],
  },
  {
    id: "loyalty",
    label: "Loyalty",
    items: [
      {
        label: "Loyalty ledger",
        href: "/loyalty",
        description: "Points, tiers, and margin-weighted awards.",
        Icon: FiStar,
        status: "live",
      },
      {
        label: "Redemptions",
        href: "/loyalty/redemptions",
        description: "Service hours, diagnostics, and rewards.",
        Icon: FiGift,
        status: "live",
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        label: "Integrations",
        href: "/integrations",
        description: "Twilio, email gateways, and webhooks.",
        Icon: FiActivity,
        status: "live",
      },
      {
        label: "Settings",
        href: "/settings",
        description: "Teams, margins, templates, and preferences.",
        Icon: FiSettings,
        status: "live",
      },
    ],
  },
];

export const iconRailItems = [
  { href: "/dashboard", Icon: FiGrid, label: "Dashboard" },
  { href: "/contacts", Icon: FiUsers, label: "Contacts" },
  { href: "/feedback", Icon: FiMessageSquare, label: "Feedback" },
  { href: "/pipeline", Icon: FiTrendingUp, label: "Pipeline" },
  { href: "/loyalty", Icon: FiStar, label: "Loyalty" },
  { href: "/settings", Icon: FiSettings, label: "Settings" },
];

export function findNavItem(pathname: string): NavItem | undefined {
  for (const section of crmNavigation) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item;
      }
    }
  }
  return undefined;
}

/** Stable lookup — avoids brittle section indexes when nav changes */
export function getNavItemByHref(href: string): NavItem {
  const item = findNavItem(href);
  if (!item) {
    throw new Error(`Navigation item not found for ${href}`);
  }
  return item;
}
