import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import { listTechnologies, saveTechnology } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
export const GET = () => apiHandler(listTechnologies);
export const POST = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveTechnology(await readJson(request));
    refreshPortfolio();
    return result;
  }, 201);
