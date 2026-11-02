import { requireAdminPage } from "@/lib/admin";
import { listTechnologies } from "@/lib/services/portfolio";
import ProjectForm from "@/components/admin/ProjectForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page() {
  await requireAdminPage();
  const technologies = await listTechnologies();
  return (
    <>
      <PageHeading
        title="Tambah proyek"
        description="Dari ide menjadi karya. Bagikan cerita dan hasilnya."
        back="/admin/projects"
      />
      <ProjectForm technologies={technologies} />
    </>
  );
}
