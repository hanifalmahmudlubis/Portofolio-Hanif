import { requireAdmin } from "@/lib/admin";
import { apiHandler, readJson } from "@/lib/api/errors";
import {
  addProjectImages,
  deleteProjectImage,
  setProjectCover,
} from "@/lib/services/images";
import { refreshPortfolio } from "@/lib/revalidate";
type Context = { params: Promise<{ id: string }> };
export const POST = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const images = await addProjectImages((await context.params).id, request);
    refreshPortfolio();
    return images;
  }, 201);
export const DELETE = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await deleteProjectImage(
      (await context.params).id,
      new URL(request.url).searchParams.get("imageId"),
    );
    refreshPortfolio();
    return result;
  });
export const PATCH = (request: Request, context: Context) =>
  apiHandler(async () => {
    await requireAdmin(request);
    const result = await setProjectCover(
      (await context.params).id,
      (await readJson(request)).imageId,
    );
    refreshPortfolio();
    return result;
  });
