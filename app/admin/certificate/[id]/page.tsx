import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import CertificateForm from "@/components/admin/CertificateForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const item = await prisma.certificate.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <>
      <PageHeading
        title="Edit sertifikat"
        description="Perbarui informasi yang tampil di portofolio Anda."
        back="/admin/certificate"
      />
      <CertificateForm certificate={item} />
    </>
  );
}
