import { requireAdmin } from "@/lib/admin";
import { apiHandler, ApiError, readJson } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { saveExperience } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
type Context = { params: Promise<{ id: string }> };
export const GET = (_request: Request, context: Context) =>
  apiHandler(async () => {
    const result = await prisma.experience.findUnique({
      where: { id: (await context.params).id },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    });
    if (!result) throw new ApiError(404, "Pengalaman tidak ditemukan.");
    return result;
  });
export const PUT = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveExperience(
      await readJson(request),
      (await context.params).id,
    );
    refreshPortfolio();
    return result;
  });
export const DELETE = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    await prisma.experience.delete({
      where: { id: (await context.params).id },
    });
    refreshPortfolio();
    return { success: true };
  });
