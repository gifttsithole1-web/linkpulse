import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { CrmPlaceholder } from "@/components/crm/CrmPlaceholder";

const item = {
  label: "Quotes",
  description: "Quotations and pricing workflows.",
};

export default function QuotesPage() {
  return (
    <CrmPageShell item={item}>
      <CrmPlaceholder
        title="Quotes"
        summary="Quotations for print, retail, and corporate services with margin metadata for loyalty."
        features={["Line items by category", "Margin coefficients", "Send for approval", "Convert to work order"]}
      />
    </CrmPageShell>
  );
}
