"use client";

import { useEffect, useRef } from "react";

const mix = (from: string, to: string, t: number) => {
  const a = from.match(/\w\w/g)!.map((value) => parseInt(value, 16));
  const b = to.match(/\w\w/g)!.map((value) => parseInt(value, 16));
  return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * t)).join(",")})`;
};

/**
 * Letters rise one by one when the text scrolls into view. Screen readers get
 * the plain text; the animated letters are hidden from them. Without JavaScript
 * (or with reduced motion) the text is simply shown.
 */
export default function SplitText({
  text,
  gradient,
  delay = 0,
  className = "",
}: {
  text: string;
  /** Optional colour ramp across the letters, e.g. ["#fbf8f3", "#c6a27c"]. */
  gradient?: [string, string];
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.dataset.split = "wait";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.dataset.split = "in";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const letters = [...text].filter((letter) => letter !== " ").length;
  let index = 0;
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} className="split" aria-hidden="true">
        {text.split(" ").map((word, w) => (
          <span key={w}>
            {w > 0 && " "}
            <span className="split-word">
              {[...word].map((letter, l) => {
                const i = index++;
                return (
                  <span
                    key={l}
                    className="split-letter"
                    style={{
                      animationDelay: `${delay + i * 0.035}s`,
                      color: gradient
                        ? mix(
                            gradient[0],
                            gradient[1],
                            i / Math.max(1, letters - 1),
                          )
                        : undefined,
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
