import { requireAdminPage } from "@/lib/admin";
import ExperienceForm from "@/components/admin/ExperienceForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page() {
  await requireAdminPage();
  return (
    <>
      <PageHeading
        title="Tambah pengalaman"
        description="Tambahkan cerita baru ke portofolio Anda."
        back="/admin/experience"
      />
      <ExperienceForm />
    </>
  );
}
