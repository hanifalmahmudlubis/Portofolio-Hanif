"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Cards that get a pointer-driven 3D tilt + glare (styled in globals.css via --rx/--ry/--gx/--gy).
const TILT = ".project-card, .certificate-card, .skill-card, .portrait-frame";
const MAX = 8; // degrees

/** Page-wide motion layer: card tilt, cursor spotlight, scroll progress. Decorative only. */
export default function Fx3D() {
  const isAdmin = usePathname().startsWith("/admin");
  const bar = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdmin) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let current: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.classList.remove("is-tilting");
    };

    const onMove = (e: PointerEvent) => {
      spot.current?.style.setProperty("--x", `${e.clientX}px`);
      spot.current?.style.setProperty("--y", `${e.clientY}px`);
      if (reduce.matches || !fine.matches) return;
      const el =
        (e.target as Element | null)?.closest<HTMLElement>(TILT) ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.setProperty("--rx", `${(0.5 - py) * MAX}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * MAX}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
    };

    const onLeave = () => current && reset(current);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.current?.style.setProperty(
          "transform",
          `scaleX(${max > 0 ? window.scrollY / max : 0})`,
        );
        ticking = false;
      });
    };

    onScroll();
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAdmin]);

  if (isAdmin) return null;
  return (
    <>
      <div ref={bar} aria-hidden="true" className="scroll-progress" />
      <div ref={spot} aria-hidden="true" className="cursor-spotlight" />
    </>
  );
}
