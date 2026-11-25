"use client";

import { useEffect, useRef } from "react";

// Rotating 3D point-cloud sphere + orbit ring, drawn on a 2D canvas (no WebGL dependency).
export default function Orb3D({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Fibonacci sphere: evenly spread points on a unit sphere
    const N = 700;
    const sphere: [number, number, number][] = Array.from(
      { length: N },
      (_, i) => {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const t = i * 2.39996;
        return [Math.cos(t) * r, y, Math.sin(t) * r];
      },
    );
    const ring: [number, number, number][] = Array.from(
      { length: 160 },
      (_, i) => {
        const t = (i / 160) * Math.PI * 2;
        return [Math.cos(t) * 1.55, Math.sin(t) * 0.25, Math.sin(t) * 1.55];
      },
    );

    let w = 0,
      h = 0,
      raf = 0,
      rot = 0,
      visible = true;
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    const project = (
      p: [number, number, number],
      R: number,
      ay: number,
      ax: number,
    ) => {
      const cosY = Math.cos(ay),
        sinY = Math.sin(ay),
        cosX = Math.cos(ax),
        sinX = Math.sin(ax);
      const x1 = p[0] * cosY - p[2] * sinY;
      const z1 = p[0] * sinY + p[2] * cosY;
      const y1 = p[1] * cosX - z1 * sinX;
      const z2 = p[1] * sinX + z1 * cosX;
      const s = 2.6 / (2.6 + z2);
      return { x: w / 2 + x1 * R * s, y: h / 2 + y1 * R * s, z: z2, s };
    };

    const draw = () => {
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      if (!reduce) rot += 0.0035;
      const ay = rot + cx * 1.2;
      const ax = 0.35 + cy * 0.8;
      const R = Math.min(w, h) * 0.34;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of sphere) {
        const q = project(p, R, ay, ax);
        const depth = (1 - q.z) / 2; // 0 back .. 1 front
        const hue = 190 + (p[1] + 1) * 55; // cyan -> violet
        ctx.fillStyle = `hsla(${hue}, 95%, 65%, ${0.15 + depth * 0.75})`;
        const size = 0.6 + depth * 1.8 * q.s;
        ctx.fillRect(q.x, q.y, size, size);
      }
      for (const p of ring) {
        const q = project(p, R, ay * 0.6, ax + 0.5);
        const depth = (1 - q.z / 1.55) / 2;
        ctx.fillStyle = `hsla(320, 90%, 70%, ${0.1 + depth * 0.7})`;
        ctx.fillRect(q.x, q.y, 1.6, 1.6);
      }

      ctx.globalCompositeOperation = "source-over";
      // reduced motion: one static frame, no loop
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    // pause rendering while the hero is off-screen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });

    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`orb-canvas ${className}`}
    />
  );
}
