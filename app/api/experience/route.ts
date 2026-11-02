import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import { listExperiences, saveExperience } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
export const GET = () => apiHandler(listExperiences);
export const POST = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveExperience(await readJson(request));
    refreshPortfolio();
    return result;
  }, 201);
