import { requireAdminPage } from "@/lib/admin";
import { listCertificates } from "@/lib/services/portfolio";

import PageHeading from "@/components/admin/PageHeading";
import ContentList from "@/components/admin/ContentList";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const items = await listCertificates();
  const saved = (await searchParams).saved === "1";
  return (
    <>
      <PageHeading
        title="Sertifikat"
        description="Kelola pencapaian dan tautan verifikasi sertifikasi Anda."
        action={{ href: "/admin/certificate/new", label: "Tambah sertifikat" }}
      />
      {saved && (
        <p role="status" className="notice mb-6">
          Perubahan berhasil disimpan. Konten publik sudah diperbarui sesuai
          status publikasi.
        </p>
      )}
      <ContentList
        kind="certificate"
        emptyLabel="Belum ada sertifikat. Tambahkan pencapaian pertama Anda."
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.issuer,
          meta: item.year,
        }))}
      />
    </>
  );
}
