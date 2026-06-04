import { ClientCreateForm } from "@/components/contacts/ClientForms";
import { FormPageHeader } from "@/components/forms/FormPageHeader";
import { AppPage, AppPageBody } from "@/components/layout/AppPage";
import { AppTopBar } from "@/components/dashboard/AppTopBar";

export default function NewContactPage() {
  return (
    <AppPage>
      <AppTopBar />
      <AppPageBody narrow>
        <FormPageHeader
          title="New contact"
          backHref="/contacts"
          backLabel="← Contacts"
        />
        <ClientCreateForm />
      </AppPageBody>
    </AppPage>
  );
}
