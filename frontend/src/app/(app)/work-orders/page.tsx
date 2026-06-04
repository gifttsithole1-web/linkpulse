import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { CrmPlaceholder } from "@/components/crm/CrmPlaceholder";

const item = {
  label: "Work orders",
  description: "Production jobs and fulfillment tracking.",
};

export default function WorkOrdersPage() {
  return (
    <CrmPageShell item={item}>
      <CrmPlaceholder
        title="Work orders"
        summary="Track production, fulfillment, and client delivery milestones."
        features={["Job status board", "Assign technician", "Link to client 360", "Completion notifications"]}
      />
    </CrmPageShell>
  );
}
