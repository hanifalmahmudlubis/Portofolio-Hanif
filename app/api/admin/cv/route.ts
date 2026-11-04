import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import { getCvEditorData } from "@/lib/services/cv";
import { saveContent } from "@/lib/services/content";
import { refreshPortfolio } from "@/lib/revalidate";

export const GET = () => apiHandler(getCvEditorData);
export const PUT = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    await saveContent(await readJson(request));
    refreshPortfolio();
    return getCvEditorData();
  });
