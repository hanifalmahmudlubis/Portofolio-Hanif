import { requireAdminPage } from "@/lib/admin";
import { listExperiences } from "@/lib/services/portfolio";
import { formatMonth } from "@/lib/site";
import PageHeading from "@/components/admin/PageHeading";
import ContentList from "@/components/admin/ContentList";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const items = await listExperiences();
  const saved = (await searchParams).saved === "1";
  return (
    <>
      <PageHeading
        title="Pengalaman"
        description="Ceritakan perjalanan profesional, kontribusi, dan dokumentasi Anda."
        action={{ href: "/admin/experience/new", label: "Tambah pengalaman" }}
      />
      {saved && (
        <p role="status" className="notice mb-6">
          Perubahan berhasil disimpan. Konten publik sudah diperbarui sesuai
          status publikasi.
        </p>
      )}
      <ContentList
        kind="experience"
        emptyLabel="Belum ada pengalaman. Tambahkan perjalanan profesional Anda."
        items={items.map((item) => ({
          id: item.id,
          title: item.position,
          subtitle: item.company,
          meta: `${formatMonth(item.startDate)} — ${item.endDate ? formatMonth(item.endDate) : "Sekarang"}`,
        }))}
      />
    </>
  );
}
