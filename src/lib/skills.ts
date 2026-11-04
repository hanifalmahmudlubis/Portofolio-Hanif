import type { SkillGroup } from "../types/cv";

export const skillCategories = [
  { key: "web", title: "Web development" },
  { key: "mobile", title: "Mobile development" },
  { key: "databases", title: "Databases" },
  { key: "machine", title: "Machine learning" },
  { key: "network", title: "Networking & automation" },
  { key: "tools", title: "Tools" },
  { key: "other", title: "Other technologies" },
];

export function skillCategory(category: string) {
  const value = category.toLowerCase();
  return /machine|\bai\b|data science/.test(value)
    ? "machine"
    : /mobile/.test(value)
      ? "mobile"
      : /database/.test(value)
        ? "databases"
        : /network|automation/.test(value)
          ? "network"
          : /web|front|framework|programming|language/.test(value)
            ? "web"
            : /tool|design|version control/.test(value)
              ? "tools"
              : "other";
}

export function buildSkillGroups(
  technologies: {
    name: string;
    category: string;
    skillGroup?: string | null;
    skillOrder?: number;
    showInSkills?: boolean;
  }[],
): SkillGroup[] {
  const groups = skillCategories.map((group) => ({
    ...group,
    skills: [] as string[],
  }));
  const known = new Set<string>();
  for (const item of [...technologies].sort(
    (a, b) => (a.skillOrder ?? 1000) - (b.skillOrder ?? 1000),
  )) {
    if (item.showInSkills === false || known.has(item.name.toLowerCase()))
      continue;
    const key = item.skillGroup || skillCategory(item.category);
    (groups.find((group) => group.key === key) || groups[6]).skills.push(
      item.name,
    );
    known.add(item.name.toLowerCase());
  }
  return groups;
}
