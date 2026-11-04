// Bump when layout or automatic content rules change, so an open editor refreshes cached PDFs.
export const CV_TEMPLATE_VERSION = 2;
export const CV_LIMITS = {
  pages: 2,
  summary: 600,
  projectPoints: 3,
  experiencePoints: 3,
  pointCharacters: 240,
} as const;

/** Keep website copy intact; only compact the automatic CV fallback at word boundaries. */
export function compactCvText(value: string, max: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  let complete = "";
  for (const { segment } of new Intl.Segmenter("en", {
    granularity: "sentence",
  }).segment(normalized)) {
    const next = [complete, segment.trim()].filter(Boolean).join(" ");
    if (next.length > max) break;
    complete = next;
  }
  if (complete.length >= max / 3) return complete;
  const candidate = normalized.slice(0, max - 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > max / 2 ? boundary : candidate.length).replace(/[\s,;:.]+$/, "")}…`;
}

// Split action clauses, while preserving lists such as "HTML, CSS, and JavaScript".
const action =
  "(?:assisted|built|configured|contributed|created|developed|engaged|implemented|improved|integrated|maintained|managed|participated|performed|processed|strengthened|supported|tested|used|worked|membantu|membuat|mengembangkan|mengimplementasikan|mengintegrasikan|meningkatkan|melakukan|berpartisipasi)";
const actionBoundary = new RegExp(
  `(?:[,;]\\s*(?:and\\s+|dan\\s+)?|\\s+(?:and|dan)\\s+)(?=${action}\\b)`,
  "i",
);

function pointCandidates(value: string, splitActions = false): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  return value
    .split(/\r?\n/)
    .flatMap((line) => {
      const clean = line.trim().replace(/^[•*-]\s+/, "");
      return [...segmenter.segment(clean)].flatMap(({ segment }) => {
        const sentence = segment
          .trim()
          .replace(/^(?:additionally|furthermore|also|in addition),?\s+/i, "");
        if (!splitActions) return [sentence];
        const parts = sentence.split(actionBoundary).map((part) => part.trim());
        const complete: string[] = [];
        for (let index = 0; index < parts.length; index++) {
          // Coordinated verbs share an object: keep "developed and integrated ..." together.
          if (parts[index].split(/\s+/).length < 2 && index + 1 < parts.length)
            parts[index + 1] = `${parts[index]} and ${parts[index + 1]}`;
          else complete.push(parts[index]);
        }
        return complete;
      });
    })
    .map((point) =>
      point
        .trim()
        .replace(/^(?:additionally|furthermore|also|in addition),?\s+/i, ""),
    )
    .filter(Boolean)
    .map((point) => point[0].toUpperCase() + point.slice(1));
}

function uniquePoints(points: string[]) {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = point.toLowerCase().replace(/[.!?…]+$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function projectCvPoints(project: {
  fullDescription: string;
  shortDescription: string;
  solution: string | null;
}) {
  const overview = pointCandidates(
    project.fullDescription || project.shortDescription,
  );
  const implementation = pointCandidates(project.solution || "");
  return uniquePoints([
    ...(overview[0] ? [overview[0]] : []),
    ...implementation,
    ...overview.slice(1),
  ])
    .slice(0, CV_LIMITS.projectPoints)
    .map((point) => compactCvText(point, CV_LIMITS.pointCharacters));
}

export function experienceCvPoints(description: string) {
  const points = uniquePoints(pointCandidates(description, true));
  const selected =
    points.length > CV_LIMITS.experiencePoints
      ? [
          ...points.slice(0, CV_LIMITS.experiencePoints - 1),
          points
            .slice(CV_LIMITS.experiencePoints - 1)
            .map((point) => (/[.!?]$/.test(point) ? point : `${point}.`))
            .join(" "),
        ]
      : points;
  return selected.map((point) =>
    compactCvText(point, CV_LIMITS.pointCharacters),
  );
}
