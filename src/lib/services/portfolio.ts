import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { ApiError } from "../api/errors";
import {
  certificateInput,
  experienceInput,
  projectInput,
  technologyInput,
} from "../validation";
import { removeUpload } from "../uploads";
import { compareExperienceDates } from "../dates";
import { getIntroImage } from "./profile";
import { getPublicProfile } from "./content";

export const projectInclude = {
  images: {
    orderBy: [
      { isThumbnail: "desc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
  },
  technologies: { include: { technology: true } },
} satisfies Prisma.ProjectInclude;
export type ProjectRecord = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;
export const listProjects = (admin = false) =>
  prisma.project.findMany({
    where: admin ? {} : { published: true },
    include: projectInclude,
    orderBy: [
      { year: "desc" },
      { displayOrder: "asc" },
      { featured: "desc" },
      { createdAt: "desc" },
    ],
  });
export const getPublicProject = cache((slug: string) =>
  prisma.project.findFirst({
    where: { slug, published: true },
    include: projectInclude,
  }),
);
export const listExperiences = async () =>
  (
    await prisma.experience.findMany({
      include: { images: { orderBy: { displayOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
  ).sort(compareExperienceDates);
export const listCertificates = () =>
  prisma.certificate.findMany({
    orderBy: [
      { year: "desc" },
      { issueDate: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });
export const listTechnologies = () =>
  prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
export const getPortfolio = async () => {
  const [
    projects,
    experiences,
    certificates,
    technologies,
    introImageUrl,
    profile,
  ] = await Promise.all([
    listProjects(),
    listExperiences(),
    listCertificates(),
    listTechnologies(),
    getIntroImage(),
    getPublicProfile(),
  ]);
  return {
    projects,
    experiences,
    certificates,
    technologies,
    introImageUrl,
    profile,
  };
};
export async function saveProject(body: Record<string, unknown>, id?: string) {
  const { technologyIds, ...data } = projectInput(body);
  if (
    technologyIds &&
    (await prisma.technology.count({
      where: { id: { in: technologyIds } },
    })) !== technologyIds.length
  )
    throw new ApiError(400, "Salah satu teknologi sudah tidak tersedia.");
  const technologies = technologyIds
    ? {
        ...(id ? { deleteMany: {} } : {}),
        create: technologyIds.map((technologyId) => ({ technologyId })),
      }
    : undefined;
  return id
    ? prisma.project.update({
        where: { id },
        data: { ...data, technologies },
        include: projectInclude,
      })
    : prisma.project.create({
        data: { ...data, technologies },
        include: projectInclude,
      });
}
export async function deleteProject(id: string) {
  const removed = await prisma.project.delete({
    where: { id },
    include: { images: true },
  });
  await Promise.all(
    removed.images.map((image) => removeUpload(image.imageUrl)),
  );
  return { success: true };
}
export async function saveExperience(
  body: Record<string, unknown>,
  id?: string,
) {
  const { images: urls, ...data } = experienceInput(body);
  const images = urls
    ? {
        ...(id ? { deleteMany: {} } : {}),
        create: urls.map((url, displayOrder) => ({ url, displayOrder })),
      }
    : undefined;
  return id
    ? prisma.experience.update({
        where: { id },
        data: { ...data, images },
        include: { images: true },
      })
    : prisma.experience.create({
        data: { ...data, images },
        include: { images: true },
      });
}
export async function saveCertificate(
  body: Record<string, unknown>,
  id?: string,
) {
  const data = certificateInput(body);
  return id
    ? prisma.certificate.update({ where: { id }, data })
    : prisma.certificate.create({ data });
}
export async function saveTechnology(body: Record<string, unknown>) {
  const data = technologyInput(body);
  const existing = await prisma.technology.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });
  return existing ?? prisma.technology.create({ data });
}
export async function getDashboard() {
  const [
    projects,
    published,
    experiences,
    certificates,
    unreadMessages,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.experience.count(),
    prisma.certificate.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.project.findMany({
      take: 5,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      include: projectInclude,
    }),
  ]);
  return {
    projects,
    published,
    drafts: projects - published,
    experiences,
    certificates,
    unreadMessages,
    recentProjects,
  };
}
