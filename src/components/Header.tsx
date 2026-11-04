"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Linkedin, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";
const menus = [
  ["Intro", "/#intro"],
  ["Projects", "/#projects"],
  ["Experience", "/#experience"],
  ["Skills", "/#skills"],
  ["Certificates", "/#certificates"],
  ["Contact", "/#contact"],
];
// A streamed or cached route can retain hidden markup with the same section IDs.
function visibleElement(id: string) {
  if (!id) return null;
  return (
    [...document.querySelectorAll<HTMLElement>(`#${CSS.escape(id)}`)].find(
      (element) => element.getClientRects().length > 0,
    ) || null
  );
}
export default function Header({
  profile = initialPublicProfile,
}: {
  profile?: PublicProfile;
}) {
  const [open, setOpen] = useState(false);
  const [visibleSection, setVisibleSection] = useState("intro");
  const navigationFrame = useRef(0);
  const pathname = usePathname();
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    setOpen(false);
    if (pathname !== "/") return;
    const id = href.split("#")[1];
    const section = visibleElement(id);
    if (!section) return;
    event.preventDefault();
    setVisibleSection(id);
    if (window.location.hash !== `#${id}`)
      window.history.pushState(null, "", href);
    cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      section.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }
  useEffect(() => {
    if (pathname !== "/") return;
    const section = visibleElement(window.location.hash.slice(1));
    const frame = section
      ? requestAnimationFrame(() =>
          section.scrollIntoView({ block: "start", behavior: "instant" }),
        )
      : 0;
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(navigationFrame.current);
    };
  }, [pathname]);
  const activeSection =
    pathname === "/"
      ? visibleSection
      : pathname.startsWith("/projects")
        ? "projects"
        : null;
  const current = (href: string) =>
    href === `/#${activeSection}`
      ? pathname === "/"
        ? ("location" as const)
        : ("page" as const)
      : undefined;
  useEffect(() => {
    if (pathname !== "/" || open) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = menus
        .map(([, href]) => visibleElement(href.split("#")[1]))
        .filter((section): section is HTMLElement => Boolean(section));
      if (!sections.length) return;
      let active = sections[0].id;
      const activationLine = Math.min(window.innerHeight * 0.3, 220);
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine)
          active = section.id;
      }
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4
      )
        active = sections[sections.length - 1].id;
      setVisibleSection(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    const main = visibleElement("main");
    if (main) observer.observe(main);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("pageshow", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [pathname, open]);
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
          <Link
            href="/"
            className="brand"
            aria-label={`${profile.fullName.split(" ")[0]} — home`}
          >
            <span className="hidden sm:inline">{profile.fullName}</span>
            <span className="sm:hidden">{profile.fullName.split(" ")[0]}</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 xl:gap-2 lg:flex"
          >
            {menus.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={(event) => navigate(event, href)}
                className="public-nav-link"
                aria-current={current(href)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={profile.githubUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="header-social"
            >
              <Github size={20} />
            </a>
            <a
              href={profile.linkedinUrl || undefined}
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
            className="flex flex-col gap-1 border-t border-border py-4 lg:hidden"
          >
            {menus.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={(event) => navigate(event, href)}
                className="public-nav-link !py-3"
                aria-current={current(href)}
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
