import { requireAdminPage } from "@/lib/admin";
import CertificateForm from "@/components/admin/CertificateForm";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page() {
  await requireAdminPage();
  return (
    <>
      <PageHeading
        title="Tambah sertifikat"
        description="Tambahkan cerita baru ke portofolio Anda."
        back="/admin/certificate"
      />
      <CertificateForm />
    </>
  );
}
