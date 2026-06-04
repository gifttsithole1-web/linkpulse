import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import type { NavItem } from "@/config/crm-navigation";

export function CrmPageShell({
  item,
  children,
  headerActions,
  backHref,
  backLabel,
}: {
  item: Pick<NavItem, "label" | "description">;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody>
        <CrmPageHeader
          item={item}
          backHref={backHref}
          backLabel={backLabel}
          actions={headerActions}
        />
        {children}
      </AppPageBody>
    </AppPage>
  );
}
