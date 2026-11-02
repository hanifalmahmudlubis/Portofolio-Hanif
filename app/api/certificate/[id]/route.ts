import { requireAdmin } from "@/lib/admin";
import { apiHandler, ApiError, readJson } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { saveCertificate } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
type Context = { params: Promise<{ id: string }> };
export const GET = (_request: Request, context: Context) =>
  apiHandler(async () => {
    const result = await prisma.certificate.findUnique({
      where: { id: (await context.params).id },
    });
    if (!result) throw new ApiError(404, "Sertifikat tidak ditemukan.");
    return result;
  });
export const PUT = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveCertificate(
      await readJson(request),
      (await context.params).id,
    );
    refreshPortfolio();
    return result;
  });
export const DELETE = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    await prisma.certificate.delete({
      where: { id: (await context.params).id },
    });
    refreshPortfolio();
    return { success: true };
  });
