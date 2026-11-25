"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Elements that tilt toward the pointer (styled in portfolio.css via --rx/--ry/--gx/--gy).
const TILT = ".project-card, .certificate-card, .skill-card, .tilt-frame";
// Elements pulled slightly toward the pointer.
const MAGNET = "#main .button, .magnetic";
const MAX = 8; // degrees

/** Page-wide motion layer: tilt, magnetic buttons, hero parallax, cursor ring, scroll progress. */
export default function Fx3D() {
  const isAdmin = usePathname().startsWith("/admin");
  const bar = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdmin) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    let ringFrame = 0;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };

    const resetTilt = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.classList.remove("is-tilting");
    };

    const followRing = () => {
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      ring.current?.style.setProperty(
        "transform",
        `translate(${pos.x}px, ${pos.y}px)`,
      );
      ringFrame =
        Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5
          ? requestAnimationFrame(followRing)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      spot.current?.style.setProperty("--x", `${e.clientX}px`);
      spot.current?.style.setProperty("--y", `${e.clientY}px`);
      if (reduce.matches || !fine.matches) return;
      const hit = e.target as Element | null;

      target.x = e.clientX;
      target.y = e.clientY;
      if (!ringFrame) ringFrame = requestAnimationFrame(followRing);
      ring.current?.classList.toggle(
        "is-active",
        !!hit?.closest("a, button, input, textarea, select, label"),
      );

      // card tilt
      const el = hit?.closest<HTMLElement>(TILT) ?? null;
      if (tilted && tilted !== el) resetTilt(tilted);
      tilted = el;
      if (el) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add("is-tilting");
        el.style.setProperty("--rx", `${(0.5 - py) * MAX}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * MAX}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
      }

      // magnetic buttons
      const m = hit?.closest<HTMLElement>(MAGNET) ?? null;
      if (magnet && magnet !== m) magnet.style.removeProperty("translate");
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
      }

      // hero 3D stage follows the pointer anywhere on screen
      const stage = document.querySelector<HTMLElement>(".hero-stage");
      if (stage) {
        stage.style.setProperty(
          "--px",
          ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3),
        );
        stage.style.setProperty(
          "--py",
          ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3),
        );
      }
    };

    const onLeave = () => {
      if (tilted) resetTilt(tilted);
      magnet?.style.removeProperty("translate");
      tilted = magnet = null;
    };

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
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(ringFrame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAdmin]);

  if (isAdmin) return null;
  return (
    <>
      <div ref={bar} aria-hidden="true" className="scroll-progress" />
      <div ref={spot} aria-hidden="true" className="cursor-spotlight" />
      <div ref={ring} aria-hidden="true" className="cursor-ring" />
    </>
  );
}
