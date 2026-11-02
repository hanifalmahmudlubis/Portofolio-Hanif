"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const sidebar = document.getElementById("admin-navigation");
    const focusable = sidebar?.querySelectorAll<HTMLElement>(
      "a, button:not([disabled])",
    );
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);
  if (pathname === "/admin/login")
    return <div className="admin-shell">{children}</div>;
  return (
    <div className="admin-shell">
      <a href="#admin-content" className="skip-link">
        Lewati navigasi
      </a>
      {open && (
        <button
          aria-label="Tutup navigasi admin"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar open={open} close={() => setOpen(false)} />
      <div className="admin-main">
        <Header open={open} onMenu={() => setOpen(!open)} />
        <main id="admin-content" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
