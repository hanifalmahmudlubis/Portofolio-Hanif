import { requireAdmin } from "@/lib/admin";
import { apiHandler, ApiError, readJson } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { refreshPortfolio } from "@/lib/revalidate";
type Context = { params: Promise<{ id: string }> };
export const PATCH = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const body = await readJson(request);
    if (typeof body.isRead !== "boolean")
      throw new ApiError(400, "Status baca tidak valid.");
    const result = await prisma.contactMessage.update({
      where: { id: (await context.params).id },
      data: { isRead: body.isRead },
    });
    refreshPortfolio();
    return result;
  });
export const DELETE = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    await prisma.contactMessage.delete({
      where: { id: (await context.params).id },
    });
    refreshPortfolio();
    return { success: true };
  });
