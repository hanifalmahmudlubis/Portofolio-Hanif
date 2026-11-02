"use client";
import { useEffect, useRef } from "react";
/** Content stays visible in SSR and without JavaScript. Motion is progressive enhancement. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (preference.matches) {
          observer.disconnect();
          return;
        }
        animation = element.animate(
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 650,
            delay: delay * 1000,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "backwards",
          },
        );
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    const stopMotion = () => {
      if (preference.matches) {
        observer.disconnect();
        animation?.cancel();
      }
    };
    preference.addEventListener("change", stopMotion);
    observer.observe(element);
    return () => {
      preference.removeEventListener("change", stopMotion);
      observer.disconnect();
      animation?.cancel();
    };
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
