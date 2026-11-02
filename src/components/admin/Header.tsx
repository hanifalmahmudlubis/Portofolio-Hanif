"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
const names: Record<string, string> = {
  dashboard: "Ringkasan",
  profile: "Foto intro",
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
    <header className="flex h-[76px] items-center justify-between gap-4 border-b border-border px-5 md:px-10">
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
        <span className="text-xs text-[#9ba6ba]">
          Admin / {names[pathname.split("/")[2]] || "Konten"}
        </span>
      </div>
      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-2 text-xs text-primary"
      >
        Lihat situs <ArrowUpRight size={13} />
      </Link>
    </header>
  );
}
