"use client";

import { useEffect, useState } from "react";

/** Cycles through words with a 3D flip. Screen readers get the full list once. */
export default function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>
      <span className="rotating-words" aria-hidden="true">
        <span key={index} className="rotating-word">
          {words[index]}
        </span>
      </span>
    </>
  );
}
