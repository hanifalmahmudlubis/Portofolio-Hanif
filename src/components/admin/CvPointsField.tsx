"use client";
import { useState } from "react";
import { CV_LIMITS } from "@/lib/cv-config";
import { Textarea } from "./Field";

export default function CvPointsField({
  name,
  label,
  initial,
}: {
  name: "cvHighlights" | "responsibilities";
  label: string;
  initial?: string[];
}) {
  const [value, setValue] = useState(initial?.join("\n") || "");
  const limit =
    name === "cvHighlights"
      ? CV_LIMITS.projectPoints
      : CV_LIMITS.experiencePoints;
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const longest = Math.max(0, ...lines.map((line) => line.length));
  return (
    <Textarea
      label={label}
      name={name}
      rows={4}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      maxLength={limit * (CV_LIMITS.pointCharacters + 1)}
      hint={`${lines.length}/${limit} poin · Poin terpanjang ${longest}/${CV_LIMITS.pointCharacters} karakter. Satu poin per baris. Kosongkan untuk menggunakan deskripsi yang dipersingkat otomatis untuk CV`}
    />
  );
}
