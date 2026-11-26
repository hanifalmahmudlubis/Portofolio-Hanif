"use client";

import { useState } from "react";
import type { BarDatum } from "@/lib/insights";

/** Single-series horizontal bar chart with direct value labels and a hover/focus tooltip. */
export default function BarChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: BarDatum[];
  unit: [string, string];
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((item) => item.value));
  const noun = (value: number) => (value === 1 ? unit[0] : unit[1]);
  return (
    <figure className="min-w-0">
      <figcaption className="panel-title">{title}</figcaption>
      <div className="bar-list" aria-hidden="true">
        {data.map((item) => (
          <div
            key={item.label}
            className="bar-row"
            tabIndex={-1}
            data-active={active === item.label}
            onPointerEnter={() => setActive(item.label)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="bar-label">{item.label}</span>
            <span className="bar-track">
              <span
                className="bar-fill block"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </span>
            <span className="bar-value">{item.value}</span>
            {active === item.label && !!item.detail?.length && (
              <span className="chart-tooltip">
                <strong>
                  {item.label} · {item.value} {noun(item.value)}
                </strong>
                {item.detail.join(", ")}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">{unit[1]}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td>
                  {item.value}
                  {item.detail?.length ? ` (${item.detail.join(", ")})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
