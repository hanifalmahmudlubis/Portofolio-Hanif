import { requireAdminPage } from "@/lib/admin";
import { listProjects } from "@/lib/services/portfolio";

import PageHeading from "@/components/admin/PageHeading";
import ContentList from "@/components/admin/ContentList";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const items = await listProjects(true);
  const saved = (await searchParams).saved === "1";
  return (
    <>
      <PageHeading
        title="Proyek"
        description="Kelola karya, galeri, teknologi, dan status publikasinya."
        action={{ href: "/admin/projects/new", label: "Tambah proyek" }}
      />
      {saved && (
        <p role="status" className="notice mb-6">
          Perubahan berhasil disimpan. Konten publik sudah diperbarui sesuai
          status publikasi.
        </p>
      )}
      <ContentList
        kind="projects"
        emptyLabel="Belum ada proyek. Mulai dengan menambahkan karya pertama."
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.category,
          meta: String(item.year),
          published: item.published,
          featured: item.featured,
          publicHref: item.published ? `/projects/${item.slug}` : undefined,
        }))}
      />
    </>
  );
}
