"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; z: number; size: number };

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
    let angle = 0;
    let offsetX = 0;
    let offsetY = 0;
    const pointer = { x: 0, y: 0 };

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const sine = Math.sin(angle);
      const cosine = Math.cos(angle);
      const projected = particles.map((particle) => {
        const x = particle.x * cosine - particle.z * sine;
        const z = particle.x * sine + particle.z * cosine;
        const perspective = 850 / (850 + z);
        return {
          x: width / 2 + x * perspective + offsetX * perspective,
          y: height / 2 + particle.y * perspective + offsetY * perspective,
          radius: particle.size * perspective,
          alpha: Math.min(0.7, 0.16 + perspective * 0.22),
        };
      });

      const connectionDistance = width < 768 ? 125 : 180;
      for (let i = 0; i < projected.length; i++) {
        const point = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const other = projected[j];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance >= connectionDistance) continue;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(74, 112, 185, ${(1 - distance / connectionDistance) * 0.17})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
        context.beginPath();
        context.arc(point.x, point.y, point.radius * 3.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(55, 101, 190, ${point.alpha * 0.08})`;
        context.fill();
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(131, 164, 222, ${point.alpha})`;
        context.fill();
      }
    }

    function tick(time: number) {
      if (document.hidden || motion.matches) return;
      if (time - lastFrame >= 1000 / 30) {
        // Clamp elapsed time so returning to the tab never jumps the scene.
        angle += Math.min(time - lastFrame, 50) * 0.000018;
        lastFrame = time;
        offsetX += (pointer.x - offsetX) * 0.035;
        offsetY += (pointer.y - offsetY) * 0.035;
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
      // The scene has real perspective depth without a WebGL dependency.
      const count = width < 768 ? 90 : 180;
      particles = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width * 1.7,
        y: (Math.random() - 0.5) * height * 1.5,
        z: (Math.random() - 0.5) * 700,
        size: 1.25 + Math.random() * 2.25,
      }));
      draw();
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointer.x = (event.clientX / width - 0.5) * 24;
      pointer.y = (event.clientY / height - 0.5) * 18;
    }

    resize();
    resume();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", resume);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
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
