import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import { listProjects, saveProject } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
export const GET = () => apiHandler(() => listProjects());
export const POST = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const project = await saveProject(await readJson(request));
    refreshPortfolio();
    return project;
  }, 201);
