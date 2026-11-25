"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ArrowUpRight, FileText } from "lucide-react";
const names: Record<string, string> = {
  dashboard: "Ringkasan",
  profile: "Foto intro",
  cv: "CV",
  projects: "Proyek",
  experience: "Pengalaman",
  certificate: "Sertifikat",
  messages: "Pesan masuk",
  session: "Sesi browser",
};
export default function Header({
  open,
  onMenu,
}: {
  open: boolean;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Buka navigasi admin"
          aria-expanded={open}
          aria-controls="admin-navigation"
          className="p-2 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="admin-crumb">
          Admin / <b>{names[pathname.split("/")[2]] || "Konten"}</b>
        </span>
      </div>
      <div className="admin-topbar-actions">
        {!pathname.startsWith("/admin/cv") && (
          <Link href="/admin/cv" className="admin-action admin-hide-sm">
            <FileText size={14} /> Buat CV
          </Link>
        )}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-2 text-xs text-primary"
        >
          Lihat situs <ArrowUpRight size={13} />
        </Link>
      </div>
    </header>
  );
}
