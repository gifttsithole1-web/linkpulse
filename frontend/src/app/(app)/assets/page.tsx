import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { CrmPlaceholder } from "@/components/crm/CrmPlaceholder";

const item = {
  label: "Assets",
  description: "Brand specs, logos, and file library.",
};

export default function AssetsPage() {
  return (
    <CrmPageShell item={item}>
      <CrmPlaceholder
        title="Assets"
        summary="Store brand_specs per client: hex codes, logos, print margins, and file references."
        features={["Per-client library", "Logo variants", "Color palettes", "Download packages"]}
      />
    </CrmPageShell>
  );
}
