import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { getDashboard } from "@/lib/services/portfolio";
import PageHeading from "@/components/admin/PageHeading";
export default async function Dashboard() {
  await requireAdminPage();
  const data = await getDashboard();
  const stats = [
    {
      label: "Proyek",
      value: data.projects,
      note: `${data.published} publik · ${data.drafts} draft`,
      href: "/admin/projects",
    },
    {
      label: "Pengalaman",
      value: data.experiences,
      note: "Total pengalaman",
      href: "/admin/experience",
    },
    {
      label: "Sertifikat",
      value: data.certificates,
      note: "Total sertifikat",
      href: "/admin/certificate",
    },
    {
      label: "Pesan baru",
      value: data.unreadMessages,
      note: "Belum dibaca",
      href: "/admin/messages",
    },
  ];
  return (
    <>
      <PageHeading
        title="Ringkasan"
        action={{ href: "/admin/projects/new", label: "Tambah proyek" }}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="admin-panel !p-5 hover:border-[#405783]"
          >
            <p className="muted text-xs">{item.label}</p>
            <p className="my-4 text-4xl font-medium tracking-tight">
              {item.value}
            </p>
            <p className="text-[13px] text-[#7887a1]">{item.note}</p>
          </Link>
        ))}
      </div>
      <section className="admin-panel mt-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-base font-medium">Proyek terbaru</h2>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-xs text-primary"
          >
            Lihat semua <ArrowUpRight size={14} />
          </Link>
        </div>
        {data.recentProjects.length ? (
          <div className="divide-y divide-border">
            {data.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm">{project.title}</h3>
                  <p className="muted mt-2 text-xs">
                    {project.category} · {project.year}
                  </p>
                </div>
                <span
                  className={`status ${project.published ? "" : "status-draft"}`}
                >
                  {project.published ? "Publik" : "Draft"}
                </span>
                <ArrowUpRight size={14} className="shrink-0 text-[#7887a1]" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted text-sm">Belum ada proyek.</p>
        )}
      </section>
    </>
  );
}
