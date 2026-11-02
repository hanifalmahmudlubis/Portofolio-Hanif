"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
const menus = [
  ["Intro", "/#intro"],
  ["Projects", "/#projects"],
  ["Experience", "/#experience"],
  ["Skills", "/#skills"],
  ["Certificates", "/#certificates"],
  ["Contact", "/#contact"],
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container flex h-[76px] items-center justify-between gap-6">
          <Link href="/" className="brand" aria-label="Hanif — home">
            <span className="hidden sm:inline">Hanif Al Mahmud Lubis</span>
            <span className="sm:hidden">Hanif</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 xl:gap-7 lg:flex"
          >
            {menus.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="public-nav-link"
                aria-current={
                  pathname.startsWith("/projects") && label === "Projects"
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="header-social"
            >
              <Github size={20} />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="header-social"
            >
              <Linkedin size={20} />
            </a>
          </div>
          <button
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
            className="icon-button lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="container flex flex-col gap-1 border-t border-border py-4 lg:hidden"
          >
            {menus.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="public-nav-link !py-3"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
