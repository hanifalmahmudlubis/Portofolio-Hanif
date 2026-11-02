import { requireAdmin } from "@/lib/admin";
import { apiHandler, ApiError, readJson } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import {
  deleteProject,
  projectInclude,
  saveProject,
} from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
type Context = { params: Promise<{ id: string }> };
export const GET = (request: Request, context: Context) =>
  apiHandler(async () => {
    const { id } = await context.params;
    const project = await prisma.project.findFirst({
      where: { id, published: true },
      include: projectInclude,
    });
    if (!project) throw new ApiError(404, "Proyek tidak ditemukan.");
    return project;
  });
export const PUT = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const project = await saveProject(
      await readJson(request),
      (await context.params).id,
    );
    refreshPortfolio();
    return project;
  });
export const DELETE = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await deleteProject((await context.params).id);
    refreshPortfolio();
    return result;
  });
