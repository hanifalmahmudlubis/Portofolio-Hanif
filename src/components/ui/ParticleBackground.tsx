"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
};

export default function ParticleBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const isAdmin = usePathname().startsWith("/admin");

  useEffect(() => {
    if (isAdmin || !canvas.current) return;
    const element = canvas.current;
    const context = element.getContext("2d", { alpha: true });
    if (!context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let lastFrame = 0;

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const connectionDistance = width < 768 ? 125 : 180;
      for (let i = 0; i < particles.length; i++) {
        const point = particles[i];
        let connections = 0;
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance >= connectionDistance) continue;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(74, 112, 185, ${(1 - distance / connectionDistance) * 0.12})`;
          context.lineWidth = 0.7;
          context.stroke();
          if (++connections === 3) break;
        }
        context.beginPath();
        context.arc(point.x, point.y, point.size * 3.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(55, 101, 190, ${point.alpha * 0.08})`;
        context.fill();
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(131, 164, 222, ${point.alpha})`;
        context.fill();
      }
    }

    function tick(time: number) {
      if (document.hidden || motion.matches) return;
      if (time - lastFrame >= 1000 / 30) {
        const elapsed = Math.min(time - lastFrame, 50) / 1000;
        for (const point of particles) {
          point.x += point.vx * elapsed;
          point.y += point.vy * elapsed;
          if (point.x < -12) point.x = width + 12;
          if (point.x > width + 12) point.x = -12;
          if (point.y < -12) point.y = height + 12;
        }
        lastFrame = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function resume() {
      cancelAnimationFrame(frame);
      draw();
      if (!motion.matches && !document.hidden) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 768 ? 90 : 180;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.25 + Math.random() * 2.25,
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 5,
        alpha: 0.2 + Math.random() * 0.25,
      }));
      draw();
    }

    resize();
    resume();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", resume);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", resume);
    };
  }, [isAdmin]);

  if (isAdmin) return null;
  return (
    <div className="ambient-scene" aria-hidden="true">
      <canvas ref={canvas} className="particle-canvas" />
    </div>
  );
}
