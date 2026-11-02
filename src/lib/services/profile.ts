import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { ApiError } from "../api/errors";
import { DEFAULT_INTRO_IMAGE } from "../site";
import { imageUrl } from "../urls";
import { prepareImages, persistImages, removeUpload } from "../uploads";

const settingsId = "portfolio";

export async function getIntroImage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: settingsId },
  });
  return imageUrl(settings?.introImageUrl) || DEFAULT_INTRO_IMAGE;
}

async function replaceImage(url: string | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const previous = await tx.siteSettings.findUnique({
            where: { id: settingsId },
          });
          await tx.siteSettings.upsert({
            where: { id: settingsId },
            create: { id: settingsId, introImageUrl: url },
            update: { introImageUrl: url },
          });
          return previous?.introImageUrl;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt === 2
      )
        throw error;
    }
  }
}

async function cleanPreviousImage(url: string | null | undefined) {
  if (!url) return;
  try {
    const references = await Promise.all([
      prisma.siteSettings.count({ where: { introImageUrl: url } }),
      prisma.projectImage.count({ where: { imageUrl: url } }),
      prisma.experienceImage.count({ where: { url } }),
    ]);
    if (references.every((count) => count === 0)) await removeUpload(url);
  } catch {
    // The new photo has already committed; cleanup must not report a failed save.
    console.error("Could not clean up the previous intro photo.");
  }
}

export async function saveIntroImage(request: Request) {
  const files = await prepareImages(request, "profile");
  if (files.length !== 1)
    throw new ApiError(400, "Pilih satu foto untuk intro.");
  await persistImages(files);
  let previous: string | null | undefined;
  try {
    previous = await replaceImage(files[0].url);
  } catch (error) {
    await removeUpload(files[0].url);
    throw error;
  }
  await cleanPreviousImage(previous);
  return { introImageUrl: files[0].url };
}

export async function resetIntroImage() {
  const previous = await replaceImage(null);
  await cleanPreviousImage(previous);
  return { introImageUrl: DEFAULT_INTRO_IMAGE };
}
