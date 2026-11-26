import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  FolderKanban,
  MessageSquare,
  Plus,
} from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { getDashboard, listProjects } from "@/lib/services/portfolio";
import { projectCover } from "@/lib/project-cover";
import { projectsByCategory, technologyUsage } from "@/lib/insights";
import BarChart from "@/components/charts/BarChart";
import Scene3D from "@/components/ui/Scene3D";
export default async function Dashboard() {
  await requireAdminPage();
  const [data, projects] = await Promise.all([
    getDashboard(),
    listProjects(true),
  ]);
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
      <section className="admin-welcome mb-8">
        <Scene3D variant="dark" />
        <div className="relative z-10 max-w-md">
          <p className="eyebrow !text-tan">Portfolio studio</p>
          <h1 className="display mt-4 text-5xl text-[#fbf8f3]">Ringkasan</h1>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin/projects/new"
              className="button !bg-[#fbf8f3] !text-ink hover:!bg-tan"
            >
              <Plus size={16} /> Tambah proyek
            </Link>
            <Link
              href="/"
              target="_blank"
              className="button border !border-white/25 text-[#fbf8f3] hover:!border-tan"
            >
              Lihat situs <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, ...item }) => (
          <Link
            key={item.href}
            href={item.href}
            className="admin-panel admin-stat !p-6"
          >
            <span className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">
                {item.label}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sand text-brand">
                <Icon size={18} strokeWidth={1.7} />
              </span>
            </span>
            <p className="admin-stat-value">{item.value}</p>
            <p className="text-[13px] text-mute">{item.note}</p>
          </Link>
        ))}
      </div>
      {!!projects.length && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="admin-panel">
            <BarChart
              title="Proyek per kategori"
              data={projectsByCategory(projects)}
              unit={["proyek", "proyek"]}
            />
          </div>
          <div className="admin-panel">
            <BarChart
              title="Teknologi paling sering dipakai"
              data={technologyUsage(projects, 6)}
              unit={["proyek", "proyek"]}
            />
          </div>
        </div>
      )}
      <section className="admin-panel mt-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="display text-2xl">Proyek terbaru</h2>
          <Link href="/admin/projects" className="text-link !py-1">
            Lihat semua <ArrowUpRight size={14} />
          </Link>
        </div>
        {data.recentProjects.length ? (
          <div className="divide-y divide-line">
            {data.recentProjects.map((project) => {
              const cover = projectCover(project);
              return (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
                    {cover && (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover object-top"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold group-hover:text-brand">
                      {project.title}
                    </h3>
                    <p className="muted mt-1 text-sm">
                      {project.category} · {project.year}
                    </p>
                  </div>
                  <span
                    className={`status ${project.published ? "" : "status-draft"}`}
                  >
                    {project.published ? "Publik" : "Draft"}
                  </span>
                  <ArrowUpRight size={15} className="shrink-0 text-mute" />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="muted text-sm">Belum ada proyek.</p>
        )}
      </section>
    </>
  );
}
