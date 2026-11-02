import { prisma } from "../prisma";
import { ApiError } from "../api/errors";
import { persistImages, prepareImages, removeUpload } from "../uploads";
export async function addProjectImages(id: string, request: Request) {
  if (
    !(await prisma.project.findUnique({ where: { id }, select: { id: true } }))
  )
    throw new ApiError(404, "Proyek tidak ditemukan.");
  const files = await prepareImages(request);
  await persistImages(files);
  try {
    return await prisma.$transaction(async (tx) => {
      const last = await tx.projectImage.aggregate({
        where: { projectId: id },
        _max: { displayOrder: true },
        _count: true,
      });
      const result = [];
      for (const [index, file] of files.entries())
        result.push(
          await tx.projectImage.create({
            data: {
              projectId: id,
              imageUrl: file.url,
              displayOrder: (last._max.displayOrder ?? -1) + 1 + index,
              isThumbnail: last._count === 0 && index === 0,
            },
          }),
        );
      return result;
    });
  } catch (error) {
    await Promise.all(files.map((file) => removeUpload(file.url)));
    throw error;
  }
}
export async function deleteProjectImage(
  projectId: string,
  imageId: string | null,
) {
  if (!imageId) throw new ApiError(400, "ID gambar wajib diisi.");
  const removed = await prisma.$transaction(async (tx) => {
    const image = await tx.projectImage.findFirst({
      where: { id: imageId, projectId },
    });
    if (!image)
      throw new ApiError(404, "Gambar tidak ditemukan pada proyek ini.");
    await tx.projectImage.delete({ where: { id: image.id } });
    if (image.isThumbnail) {
      const next = await tx.projectImage.findFirst({
        where: { projectId },
        orderBy: { displayOrder: "asc" },
      });
      if (next)
        await tx.projectImage.update({
          where: { id: next.id },
          data: { isThumbnail: true },
        });
    }
    return image;
  });
  await removeUpload(removed.imageUrl);
  return { success: true };
}
export async function setProjectCover(projectId: string, imageId: unknown) {
  if (typeof imageId !== "string")
    throw new ApiError(400, "ID gambar wajib diisi.");
  return prisma.$transaction(async (tx) => {
    const image = await tx.projectImage.findFirst({
      where: { id: imageId, projectId },
    });
    if (!image)
      throw new ApiError(404, "Gambar tidak ditemukan pada proyek ini.");
    await tx.projectImage.updateMany({
      where: { projectId },
      data: { isThumbnail: false },
    });
    return tx.projectImage.update({
      where: { id: imageId },
      data: { isThumbnail: true },
    });
  });
}
