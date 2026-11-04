import { ApiError } from "./api/error";
import { normalizeMonth, compareExperienceDates } from "./dates";
import { safeUrl } from "./urls";
import { skillCategories } from "./skills";
import { CV_LIMITS } from "./cv-config";
import type { ContentSettings, PersonalProfile, SkillGroup } from "../types/cv";

function fail(field: string): never {
  throw new ApiError(400, `Periksa kolom ${field}`, {
    [field]: "Data tidak valid atau melebihi batas",
  });
}
function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(field);
  return value as Record<string, unknown>;
}
function text(
  value: unknown,
  field: string,
  max: number,
  required = false,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    fail(field);
  return value.trim();
}
function list(value: unknown, field: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail(field);
  return value;
}
function strings(value: unknown, field: string, max: number, length: number) {
  return [
    ...new Set(
      list(value, field, max).map((item) => text(item, field, length, true)),
    ),
  ];
}
function month(value: unknown, field: string) {
  const parsed = normalizeMonth(text(value, field, 30, true));
  if (!parsed) fail(field);
  return parsed;
}
function bool(value: unknown, field: string) {
  if (typeof value !== "boolean") fail(field);
  return value;
}

export function cvContentInput(
  input: Record<string, unknown>,
): ContentSettings & { skillGroups: SkillGroup[] } {
  const raw = record(input.profile, "profile");
  const profile: PersonalProfile = {
    fullName: text(raw.fullName, "fullName", 150, true),
    professionalTitle: text(
      raw.professionalTitle,
      "professionalTitle",
      160,
      true,
    ),
    shortBio: text(raw.shortBio, "shortBio", 500, true),
    summary: text(raw.summary, "summary", CV_LIMITS.summary, true),
    location: text(raw.location, "location", 200),
    email: text(raw.email, "email", 254, true),
    phone: text(raw.phone, "phone", 40),
    linkedinUrl: text(raw.linkedinUrl, "linkedinUrl", 2048),
    githubUrl: text(raw.githubUrl, "githubUrl", 2048),
    portfolioUrl: text(raw.portfolioUrl, "portfolioUrl", 2048),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) fail("email");
  if (profile.phone && !/^[+\d\s().-]+$/.test(profile.phone)) fail("phone");
  for (const key of ["linkedinUrl", "githubUrl", "portfolioUrl"] as const) {
    if (profile[key] && !safeUrl(profile[key])) fail(key);
  }
  const education = list(input.education, "education", 10)
    .map((value) => {
      const row = record(value, "education");
      const startDate = month(row.startDate, "education.startDate");
      const endDate = row.endDate
        ? month(row.endDate, "education.endDate")
        : null;
      if (endDate && endDate < startDate) fail("education.endDate");
      return {
        id: text(row.id, "education.id", 100, true),
        institution: text(row.institution, "education.institution", 200, true),
        degree: text(row.degree, "education.degree", 200, true),
        major: text(row.major, "education.major", 200),
        location: text(row.location, "education.location", 200),
        gpa: text(row.gpa, "education.gpa", 40),
        startDate,
        endDate,
      };
    })
    .sort(compareExperienceDates);
  if (new Set(education.map((row) => row.id)).size !== education.length)
    fail("education.id");
  const languages = list(input.languages, "languages", 20).map((value) => {
    const row = record(value, "languages");
    return {
      name: text(row.name, "languages.name", 100, true),
      proficiency: text(row.proficiency, "languages.proficiency", 100, true),
    };
  });
  const settings = record(input.preferences, "preferences");
  const preferences = {
    includePhoto: bool(settings.includePhoto, "includePhoto"),
    excludedProjectIds: strings(
      settings.excludedProjectIds,
      "excludedProjectIds",
      300,
      100,
    ),
    excludedExperienceIds: strings(
      settings.excludedExperienceIds,
      "excludedExperienceIds",
      300,
      100,
    ),
    excludedCertificateIds: strings(
      settings.excludedCertificateIds,
      "excludedCertificateIds",
      300,
      100,
    ),
  };
  const seen = new Set<string>();
  const skillGroups = list(input.skillGroups, "skillGroups", 7).map((value) => {
    const row = record(value, "skillGroups");
    const group = skillCategories.find((group) => group.key === row.key);
    if (!group) fail("skillGroups.key");
    const skills = strings(row.skills, "skills", 60, 60);
    for (const name of skills) {
      if (seen.has(name.toLowerCase())) fail("skills (duplikat)");
      seen.add(name.toLowerCase());
    }
    return { ...group, skills };
  });
  if (
    new Set(skillGroups.map((row) => row.key)).size !== skillGroups.length ||
    seen.size > 200
  )
    fail("skillGroups");
  return {
    profile,
    education,
    languages,
    preferences,
    skillGroups,
    softSkills: strings(input.softSkills, "softSkills", 30, 100),
  };
}

export function bulletInput(
  value: unknown,
  field: string,
): string[] | undefined {
  if (value === undefined) return undefined;
  const max =
    field === "cvHighlights"
      ? CV_LIMITS.projectPoints
      : CV_LIMITS.experiencePoints;
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some(
      (item) =>
        typeof item !== "string" ||
        item.trim().length > CV_LIMITS.pointCharacters,
    )
  ) {
    throw new ApiError(
      400,
      `Poin CV maksimal ${max} poin, masing-masing ${CV_LIMITS.pointCharacters} karakter`,
      {
        [field]: `Maksimal ${max} poin dan ${CV_LIMITS.pointCharacters} karakter per poin`,
      },
    );
  }
  return strings(value, field, max, CV_LIMITS.pointCharacters);
}
