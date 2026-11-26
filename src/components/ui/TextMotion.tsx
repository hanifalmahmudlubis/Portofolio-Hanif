"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TEXT = "main p, main dd, main .tag";

/**
 * Public pages only: paragraphs ease in as they scroll into view, and the home page
 * always opens on the portrait screen unless a section was linked directly.
 */
export default function TextMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (pathname !== "/" || (hash && hash !== "#intro" && hash !== "#home"))
      return;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.text = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      for (const element of document.querySelectorAll<HTMLElement>(TEXT)) {
        if (
          seen.has(element) ||
          element.closest("form, dialog, .splash, .skills-grid")
        )
          continue;
        seen.add(element);
        // Content already on screen stays put; only text below the fold animates.
        if (element.getBoundingClientRect().top < window.innerHeight * 0.92)
          continue;
        element.dataset.text = "wait";
        observer.observe(element);
      }
    };
    scan();
    // Client-side filtering (projects) can insert new paragraphs later.
    const mutations = new MutationObserver(scan);
    const main = document.querySelector("main");
    if (main) mutations.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
      for (const element of document.querySelectorAll<HTMLElement>(
        "[data-text]",
      ))
        delete element.dataset.text;
    };
  }, [pathname]);

  return null;
}
