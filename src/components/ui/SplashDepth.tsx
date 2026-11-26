"use client";

import { useEffect, useRef } from "react";

/**
 * Feeds pointer and scroll position to the opening screen as CSS variables
 * (--mx, --my in -1..1 and --scroll in 0..1) so its layers can move at
 * different depths. Does nothing for reduced-motion users.
 */
export default function SplashDepth({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      element.style.setProperty("--mx", current.x.toFixed(4));
      element.style.setProperty("--my", current.y.toFixed(4));
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(1, element.offsetHeight)),
      );
      element.style.setProperty("--scroll", progress.toFixed(4));
      frame =
        Math.abs(target.x - current.x) > 0.001 ||
        Math.abs(target.y - current.y) > 0.001
          ? requestAnimationFrame(tick)
          : 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", schedule);
    };
  }, []);
  return (
    <div ref={ref} id={id} className={className}>
      {children}
    </div>
  );
}
