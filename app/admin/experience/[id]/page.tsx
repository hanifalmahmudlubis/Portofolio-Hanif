import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import ExperienceForm from "@/components/admin/ExperienceForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const item = await prisma.experience.findUnique({
    where: { id },
    include: { images: { orderBy: { displayOrder: "asc" } } },
  });
  if (!item) notFound();
  return (
    <>
      <PageHeading
        title="Edit pengalaman"
        description="Perbarui informasi yang tampil di portofolio Anda."
        back="/admin/experience"
      />
      <ExperienceForm experience={item} />
    </>
  );
}
