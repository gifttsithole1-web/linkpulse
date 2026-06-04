import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { CrmPlaceholder } from "@/components/crm/CrmPlaceholder";

const item = {
  label: "Proofing",
  description: "Design assets, approvals, and signatures.",
};

export default function ProofingPage() {
  return (
    <CrmPageShell item={item}>
      <CrmPlaceholder
        title="Proofing"
        summary="Design review, client approvals, and signed-off assets."
        features={["Version history", "Client approve/reject", "Signature capture", "Export print-ready files"]}
      />
    </CrmPageShell>
  );
}
