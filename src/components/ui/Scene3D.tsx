"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneVariant } from "./scene-engine";

/** Decorative WebGL scene; three.js is loaded only in the browser, after hydration. */
export default function Scene3D({
  variant = "light",
  className = "",
}: {
  variant?: SceneVariant;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("./scene-engine")
      .then(({ createScene }) => {
        if (disposed || !host.current) return;
        try {
          cleanup = createScene(host.current, variant);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      cleanup();
    };
  }, [variant]);

  return (
    <div ref={host} className={`scene ${className}`} aria-hidden="true">
      {failed && <div className="scene-fallback" />}
    </div>
  );
}
