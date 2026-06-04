import { CompanyCreateForm } from "@/components/companies/CompanyCreateForm";
import { FormPageHeader } from "@/components/forms/FormPageHeader";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";

export default function NewCompanyPage() {
  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody narrow>
        <FormPageHeader
          title="New company"
          backHref="/companies"
          backLabel="← Companies"
        />
        <CompanyCreateForm />
      </AppPageBody>
    </AppPage>
  );
}
