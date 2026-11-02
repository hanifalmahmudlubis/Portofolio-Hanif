import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api/errors";
import { listProjects } from "@/lib/services/portfolio";
export const GET = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    return listProjects(true);
  });
