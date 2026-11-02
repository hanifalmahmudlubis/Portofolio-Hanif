import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import { listCertificates, saveCertificate } from "@/lib/services/portfolio";
import { refreshPortfolio } from "@/lib/revalidate";
export const GET = () => apiHandler(listCertificates);
export const POST = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveCertificate(await readJson(request));
    refreshPortfolio();
    return result;
  }, 201);
