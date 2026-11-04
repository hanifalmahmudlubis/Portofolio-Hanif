import "server-only";
import { createHash } from "node:crypto";
import { requireAdmin } from "../admin";
import { getContentSettings } from "./content";
import { getIntroImage } from "./profile";
import {
  listProjects,
  listExperiences,
  listCertificates,
  listTechnologies,
} from "./portfolio";
import { buildSkillGroups } from "../skills";
import {
  CV_LIMITS,
  CV_TEMPLATE_VERSION,
  projectCvPoints,
  experienceCvPoints,
} from "../cv-config";
import type { CvEditorData, CvDocumentData } from "../../types/cv";

async function getCvBundle() {
  await requireAdmin();
  const [content, projects, experiences, certificates, technologies, photo] =
    await Promise.all([
      getContentSettings(),
      listProjects(),
      listExperiences(),
      listCertificates(),
      listTechnologies(),
      getIntroImage(),
    ]);
  const bundle = {
    content,
    projects,
    experiences,
    certificates,
    skillGroups: buildSkillGroups(technologies),
    photo,
  };
  return {
    ...bundle,
    revision: createHash("sha256")
      .update(
        JSON.stringify({ templateVersion: CV_TEMPLATE_VERSION, ...bundle }),
      )
      .digest("hex"),
  };
}
export async function getCvEditorData(): Promise<CvEditorData> {
  const {
    content,
    projects,
    experiences,
    certificates,
    skillGroups,
    revision,
  } = await getCvBundle();
  return {
    ...content,
    skillGroups,
    revision,
    sources: {
      projects: projects.map(({ id, title, year }) => ({ id, title, year })),
      experiences: experiences.map(
        ({ id, company, position, startDate, endDate }) => ({
          id,
          company,
          position,
          startDate,
          endDate,
        }),
      ),
      certificates: certificates.map(({ id, title, year }) => ({
        id,
        title,
        year,
      })),
    },
  };
}

export async function getCvDocumentData(): Promise<CvDocumentData> {
  const {
    content,
    projects,
    experiences,
    certificates,
    skillGroups,
    photo,
    revision,
  } = await getCvBundle();
  const { preferences } = content;
  return {
    ...content,
    revision,
    skillGroups,
    photo,
    projects: projects
      .filter((row) => !preferences.excludedProjectIds.includes(row.id))
      .map((row) => ({
        id: row.id,
        title: row.title,
        projectType: row.projectType,
        year: row.year,
        technologies: row.technologies.map((item) => item.technology.name),
        highlights: row.cvHighlights.length
          ? row.cvHighlights.slice(0, CV_LIMITS.projectPoints)
          : projectCvPoints(row),
        liveDemoUrl: row.liveDemoUrl,
      })),
    experiences: experiences
      .filter((row) => !preferences.excludedExperienceIds.includes(row.id))
      .map((row) => ({
        id: row.id,
        company: row.company,
        position: row.position,
        location: row.location,
        employmentType: row.employmentType,
        startDate: row.startDate,
        endDate: row.endDate,
        responsibilities: row.responsibilities.length
          ? row.responsibilities.slice(0, CV_LIMITS.experiencePoints)
          : experienceCvPoints(row.description),
      })),
    certificates: certificates
      .filter((row) => !preferences.excludedCertificateIds.includes(row.id))
      .map(({ id, title, issuer, year, issueDate, credentialUrl }) => ({
        id,
        title,
        issuer,
        year,
        issueDate,
        credentialUrl,
      })),
  };
}
