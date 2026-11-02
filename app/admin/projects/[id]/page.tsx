import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { listTechnologies, projectInclude } from "@/lib/services/portfolio";
import ProjectForm from "@/components/admin/ProjectForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const [project, technologies] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: projectInclude }),
    listTechnologies(),
  ]);
  if (!project) notFound();
  return (
    <>
      <PageHeading
        title="Edit proyek"
        description="Perbarui detail karya, gambar, dan publikasi Anda."
        back="/admin/projects"
      />
      <ProjectForm project={project} technologies={technologies} />
    </>
  );
}
