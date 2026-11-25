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
  UserRound,
  FileText,
  ShieldCheck,
} from "lucide-react";
const navigation = [
  {
    group: "Utama",
    items: [
      { title: "Ringkasan", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Konten portofolio",
    items: [
      { title: "Proyek", href: "/admin/projects", icon: FolderKanban },
      { title: "Pengalaman", href: "/admin/experience", icon: Briefcase },
      { title: "Sertifikat", href: "/admin/certificate", icon: Award },
      { title: "Foto intro", href: "/admin/profile", icon: UserRound },
    ],
  },
  {
    group: "Karier",
    items: [
      { title: "CV", href: "/admin/cv", icon: FileText },
      { title: "Pesan masuk", href: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    group: "Akun",
    items: [
      { title: "Sesi browser", href: "/admin/session", icon: ShieldCheck },
    ],
  },
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
        <Link
          href="/admin/dashboard"
          onClick={close}
          className="brand admin-brand"
        >
          <span className="admin-logo" aria-hidden="true">
            HL
          </span>
          <span>
            Hanif
            <small>Portfolio Studio</small>
          </span>
        </Link>
        <button
          onClick={close}
          className="p-2 lg:hidden"
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav aria-label="Navigasi admin" className="mt-2">
        {navigation.map(({ group, items }) => (
          <div key={group}>
            <p className="admin-nav-group">{group}</p>
            <div className="space-y-1">
              {items.map(({ title, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="admin-nav-link"
                  aria-current={pathname.startsWith(href) ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-footer space-y-1">
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
