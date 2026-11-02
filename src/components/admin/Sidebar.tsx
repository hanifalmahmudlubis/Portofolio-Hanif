"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Award,
  MessageSquare,
  LogOut,
  ArrowUpRight,
  X,
} from "lucide-react";
const navigation = [
  { title: "Ringkasan", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Proyek", href: "/admin/projects", icon: FolderKanban },
  { title: "Pengalaman", href: "/admin/experience", icon: Briefcase },
  { title: "Sertifikat", href: "/admin/certificate", icon: Award },
  { title: "Pesan masuk", href: "/admin/messages", icon: MessageSquare },
];
export default function Sidebar({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside id="admin-navigation" className="admin-sidebar" data-open={open}>
      <div className="flex items-center justify-between">
        <Link href="/admin/dashboard" onClick={close} className="brand">
          Hanif
        </Link>
        <button
          onClick={close}
          className="p-2 lg:hidden"
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>
      <p className="muted mb-4 mt-10 px-3 text-[12px] uppercase tracking-wider">
        Admin
      </p>
      <nav aria-label="Navigasi admin" className="space-y-1">
        {navigation.map(({ title, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={close}
            className="admin-nav-link"
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            <Icon size={16} strokeWidth={1.5} />
            {title}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t border-border pt-5">
        <Link href="/" target="_blank" className="admin-nav-link">
          Lihat portofolio <ArrowUpRight size={14} className="ml-auto" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="admin-nav-link w-full"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
