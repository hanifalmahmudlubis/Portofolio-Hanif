import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api/errors";
import {
  getIntroImage,
  saveIntroImage,
  resetIntroImage,
} from "@/lib/services/profile";
import { refreshPortfolio } from "@/lib/revalidate";

export const GET = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    return { introImageUrl: await getIntroImage() };
  });

export const POST = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await saveIntroImage(request);
    refreshPortfolio();
    return result;
  });

export const DELETE = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await resetIntroImage();
    refreshPortfolio();
    return result;
  });
