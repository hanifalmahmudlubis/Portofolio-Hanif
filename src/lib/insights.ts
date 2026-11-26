import { normalizeMonth } from "./dates";

export type BarDatum = { label: string; value: number; detail?: string[] };

type ProjectLike = {
  title: string;
  category: string;
  year: number;
  technologies: { technology: { name: string } }[];
};

const byValue = (a: BarDatum, b: BarDatum) =>
  b.value - a.value || a.label.localeCompare(b.label);

/** Number of projects in each category, with the project titles for the tooltip. */
export function projectsByCategory(projects: ProjectLike[]): BarDatum[] {
  const groups = new Map<string, string[]>();
  for (const project of projects)
    groups.set(project.category, [
      ...(groups.get(project.category) || []),
      project.title,
    ]);
  return [...groups]
    .map(([label, detail]) => ({ label, value: detail.length, detail }))
    .sort(byValue);
}

/** Projects per year in chronological order. */
export function projectsByYear(projects: ProjectLike[]): BarDatum[] {
  const groups = new Map<number, string[]>();
  for (const project of projects)
    groups.set(project.year, [
      ...(groups.get(project.year) || []),
      project.title,
    ]);
  return [...groups]
    .sort(([a], [b]) => a - b)
    .map(([year, detail]) => ({
      label: String(year),
      value: detail.length,
      detail,
    }));
}

/** How many projects use each technology — a measured stand-in for "skill level". */
export function technologyUsage(
  projects: ProjectLike[],
  limit = 8,
): BarDatum[] {
  const usage = new Map<string, string[]>();
  for (const project of projects)
    for (const { technology } of project.technologies)
      usage.set(technology.name, [
        ...(usage.get(technology.name) || []),
        project.title,
      ]);
  return [...usage]
    .map(([label, detail]) => ({ label, value: detail.length, detail }))
    .sort(byValue)
    .slice(0, limit);
}

const monthIndex = (value: string | null) => {
  const month = value ? normalizeMonth(value) : null;
  if (!month) return null;
  const [year, number] = month.split("-").map(Number);
  return year * 12 + (number - 1);
};

export type JourneyStop = {
  id: string;
  kind: "education" | "work";
  title: string;
  place: string;
  date: string;
  month: number;
  current: boolean;
};

/** Education and experience milestones in chronological order, ending at today. */
export function lifeJourney(
  experiences: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
  }[],
  education: {
    id: string;
    institution: string;
    major: string;
    startDate: string;
    endDate: string | null;
    gpa: string;
  }[],
  formatMonth: (value: string) => string,
  now = new Date(),
): JourneyStop[] {
  const today = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const stops: JourneyStop[] = [];
  for (const item of education) {
    const start = monthIndex(item.startDate);
    if (start !== null)
      stops.push({
        id: `${item.id}-start`,
        kind: "education",
        title: item.major,
        place: item.institution,
        date: formatMonth(item.startDate),
        month: start,
        current: false,
      });
    const end = monthIndex(item.endDate);
    if (end !== null && end <= today)
      stops.push({
        id: `${item.id}-end`,
        kind: "education",
        title: "Graduated",
        place: item.gpa
          ? `${item.institution} · GPA ${item.gpa}`
          : item.institution,
        date: formatMonth(item.endDate!),
        month: end,
        current: false,
      });
  }
  for (const item of experiences) {
    const start = monthIndex(item.startDate);
    if (start === null) continue;
    stops.push({
      id: item.id,
      kind: "work",
      title: item.position,
      place: item.company,
      date: formatMonth(item.startDate),
      month: start,
      current: !item.endDate,
    });
  }
  return stops.sort((a, b) => a.month - b.month || a.id.localeCompare(b.id));
}
