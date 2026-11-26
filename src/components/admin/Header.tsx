"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
const names: Record<string, string> = {
  dashboard: "Ringkasan",
  profile: "Foto intro",
  cv: "CV",
  projects: "Proyek",
  experience: "Pengalaman",
  certificate: "Sertifikat",
  messages: "Pesan masuk",
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
          className="icon-button lg:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="admin-crumb">
          Admin / <strong>{names[pathname.split("/")[2]] || "Konten"}</strong>
        </span>
      </div>
      <Link
        href="/"
        target="_blank"
        className="button button-secondary !min-h-10 !px-4 !text-[13px]"
      >
        Lihat situs <ArrowUpRight size={14} />
      </Link>
    </header>
  );
}
