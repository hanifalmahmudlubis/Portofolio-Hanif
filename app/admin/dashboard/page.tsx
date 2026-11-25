import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Download,
  FileText,
  FolderKanban,
  MessageSquare,
  Plus,
} from "lucide-react";
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
      icon: FolderKanban,
    },
    {
      label: "Pengalaman",
      value: data.experiences,
      note: "Total pengalaman",
      href: "/admin/experience",
      icon: Briefcase,
    },
    {
      label: "Sertifikat",
      value: data.certificates,
      note: "Total sertifikat",
      href: "/admin/certificate",
      icon: Award,
    },
    {
      label: "Pesan baru",
      value: data.unreadMessages,
      note: "Belum dibaca",
      href: "/admin/messages",
      icon: MessageSquare,
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
            className="admin-panel admin-stat !p-5"
          >
            <span className="admin-stat-icon" aria-hidden="true">
              <item.icon size={18} />
            </span>
            <p className="muted text-xs">{item.label}</p>
            <p className="admin-stat-value">{item.value}</p>
            <p className="text-[13px] text-[#7c8aa0]">{item.note}</p>
          </Link>
        ))}
      </div>
      <section className="admin-panel admin-cv-card mt-7">
        <div>
          <h2 className="text-lg font-semibold">CV otomatis</h2>
          <p className="muted mt-2 max-w-2xl text-sm leading-6">
            CV disusun otomatis dari data portofolio dengan layout satu kolom
            (foto, profil, pendidikan, pengalaman, proyek, sertifikat, skill).
            Ubah data di sini, lalu unduh PDF-nya.
          </p>
          <div className="admin-cv-sources">
            <span className="admin-chip">
              <b>{data.experiences}</b> pengalaman
            </span>
            <span className="admin-chip">
              <b>{data.published}</b> proyek publik
            </span>
            <span className="admin-chip">
              <b>{data.certificates}</b> sertifikat
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/cv" className="button button-secondary">
            <FileText size={15} /> Atur CV
          </Link>
          <a
            href="/api/admin/cv/pdf?download=1"
            className="button button-primary"
          >
            <Download size={15} /> Unduh CV (PDF)
          </a>
        </div>
      </section>
      <section className="mt-7" aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="mb-3 text-base font-semibold">
          Aksi cepat
        </h2>
        <div className="admin-quick">
          <Link href="/admin/projects/new">
            <Plus size={16} /> Proyek baru
          </Link>
          <Link href="/admin/experience/new">
            <Plus size={16} /> Pengalaman baru
          </Link>
          <Link href="/admin/certificate/new">
            <Plus size={16} /> Sertifikat baru
          </Link>
        </div>
      </section>
      <section className="admin-panel mt-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Proyek terbaru</h2>
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
