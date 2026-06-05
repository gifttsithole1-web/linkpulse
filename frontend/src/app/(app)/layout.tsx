import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireStaffSession } from "@/lib/auth/require-staff";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaffSession();
  return <DashboardShell>{children}</DashboardShell>;
}
