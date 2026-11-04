import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { cvContentInput } from "../cv-validation";
import { defaultContent } from "./content-defaults";
import type { ContentSettings, PublicProfile } from "../../types/cv";

export const getContentSettings = cache(async (): Promise<ContentSettings> => {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "portfolio" },
  });
  const parsed = cvContentInput({
    profile: row?.profile ?? defaultContent.profile,
    education: row?.education ?? defaultContent.education,
    softSkills: row?.softSkills ?? defaultContent.softSkills,
    languages: row?.languages ?? defaultContent.languages,
    preferences: row?.cvPreferences ?? defaultContent.preferences,
    skillGroups: [],
  });
  const { skillGroups: _groups, ...content } = parsed;
  void _groups;
  return content;
});

export const getPublicProfile = cache(async (): Promise<PublicProfile> => {
  const { profile, education } = await getContentSettings();
  return {
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle,
    shortBio: profile.shortBio,
    location: profile.location,
    email: profile.email,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    educationLine: education[0]
      ? `A graduate of ${education[0].institution}`
      : "",
  };
});

const json = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

export async function saveContent(body: Record<string, unknown>) {
  const {
    skillGroups,
    profile,
    education,
    softSkills,
    languages,
    preferences,
  } = cvContentInput(body);
  await prisma.$transaction(
    async (tx) => {
      const data = {
        profile: json(profile),
        education: json(education),
        softSkills: json(softSkills),
        languages: json(languages),
        cvPreferences: json(preferences),
      };
      await tx.siteSettings.upsert({
        where: { id: "portfolio" },
        create: { id: "portfolio", ...data },
        update: data,
      });
      // Hiding a skill keeps technologies attached to existing projects intact.
      await tx.technology.updateMany({ data: { showInSkills: false } });
      const existing = await tx.technology.findMany({ orderBy: { id: "asc" } });
      for (const group of skillGroups) {
        for (const [skillOrder, name] of group.skills.entries()) {
          const match = existing.find(
            (item) => item.name.toLowerCase() === name.toLowerCase(),
          );
          const attributes = {
            showInSkills: true,
            skillGroup: group.key,
            skillOrder,
          };
          if (match)
            await tx.technology.update({
              where: { id: match.id },
              data: attributes,
            });
          else
            await tx.technology.create({
              data: { name, category: group.title, ...attributes },
            });
        }
      }
    },
    { timeout: 20000 },
  );
}
