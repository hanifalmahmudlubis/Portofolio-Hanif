import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api/errors";
import { getDashboard } from "@/lib/services/portfolio";
export const GET = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    return getDashboard();
  });
