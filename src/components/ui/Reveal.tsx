"use client";
import { useEffect, useRef } from "react";

type Direction = "none" | "left" | "right" | "up" | "down" | "fade";

/** Motion is opt-in; the underlying content remains visible without animation. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  from = "none",
  repeat = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: Direction;
  repeat?: boolean;
  as?: "div" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || from === "none") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const distance =
      window.innerWidth < 768 ? 16 : window.innerWidth < 1024 ? 20 : 32;
    const origin = {
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      fade: "none",
    }[from];
    let entered = false;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (preference.matches || element.contains(document.activeElement)) {
            animation?.cancel();
            continue;
          }
          if (entry.isIntersecting) {
            animation?.cancel();
            animation = element.animate(
              [
                { opacity: 0, transform: origin },
                { opacity: 1, transform: "none" },
              ],
              {
                duration: from === "fade" ? 600 : 850,
                delay: entered ? 0 : delay * 1000,
                easing: "cubic-bezier(.22,1,.36,1)",
                fill: "backwards",
              },
            );
            entered = true;
            if (!repeat) observer.disconnect();
          } else if (repeat && entered) {
            animation?.cancel();
            animation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 200,
              fill: "forwards",
            });
          }
        }
      },
      { threshold: 0, rootMargin: "-76px 0px 0px 0px" },
    );
    const stopMotion = () => {
      if (preference.matches) {
        observer.disconnect();
        animation?.cancel();
      } else {
        observer.observe(element);
      }
    };
    const revealOnFocus = () => animation?.cancel();
    preference.addEventListener("change", stopMotion);
    element.addEventListener("focusin", revealOnFocus);
    if (!preference.matches) observer.observe(element);
    return () => {
      preference.removeEventListener("change", stopMotion);
      element.removeEventListener("focusin", revealOnFocus);
      observer.disconnect();
      animation?.cancel();
    };
  }, [delay, from, repeat]);
  return (
    <Tag
      ref={(element: HTMLElement | null) => {
        ref.current = element;
      }}
      className={className}
      data-reveal={from === "none" ? undefined : from}
    >
      {children}
    </Tag>
  );
}
