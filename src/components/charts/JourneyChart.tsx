import { Briefcase, GraduationCap } from "lucide-react";
import type { JourneyStop } from "@/lib/insights";
import InView from "../ui/InView";

/** Smooth path through alternating points; horizontal tangents keep the curve calm. */
function curve(points: [number, number][]) {
  const all: [number, number][] = [[0, 100], ...points, [1000, 100]];
  let path = `M ${all[0][0]} ${all[0][1]}`;
  for (let i = 1; i < all.length; i++) {
    const [x0, y0] = all[i - 1];
    const [x1, y1] = all[i];
    const dx = (x1 - x0) / 2;
    path += ` C ${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}`;
  }
  return path;
}

/** "Life journey": a winding road from the first milestone to the present. */
export default function JourneyChart({ stops }: { stops: JourneyStop[] }) {
  if (!stops.length) return null;
  const count = stops.length;
  const points = stops.map((_, index): [number, number] => [
    ((index + 0.5) / count) * 1000,
    index % 2 ? 156 : 44,
  ]);
  return (
    <InView className="journey">
      <p className="panel-title">Journey</p>
      <div
        className="journey-track"
        style={{ "--count": count } as React.CSSProperties}
      >
        <svg
          className="journey-line"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="journey-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#d9c3a5" />
              <stop offset="0.55" stopColor="#8b6544" />
              <stop offset="1" stopColor="#1a1310" />
            </linearGradient>
          </defs>
          <path
            className="journey-glow"
            d={curve(points)}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="journey-path"
            d={curve(points)}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ol className="journey-stops">
          {stops.map((stop, index) => {
            const Icon = stop.kind === "education" ? GraduationCap : Briefcase;
            return (
              <li
                key={stop.id}
                className="journey-stop"
                data-side={index % 2 ? "bottom" : "top"}
                data-edge={
                  index === 0
                    ? "start"
                    : index === count - 1
                      ? "end"
                      : undefined
                }
                data-current={stop.current || undefined}
                style={
                  {
                    "--x": `${points[index][0] / 10}%`,
                    "--y": points[index][1],
                    "--delay": `${0.25 + index * 0.12}s`,
                  } as React.CSSProperties
                }
              >
                <span className="journey-dot" aria-hidden="true">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <div className="journey-card">
                  <time>{stop.current ? `${stop.date} — Now` : stop.date}</time>
                  <strong>{stop.title}</strong>
                  <span>{stop.place}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </InView>
  );
}
