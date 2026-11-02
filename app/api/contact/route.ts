import { apiHandler, readJson, ApiError } from "@/lib/api/errors";
import { checkOrigin } from "@/lib/admin";
import { contactInput } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { refreshPortfolio } from "@/lib/revalidate";
export const POST = (request: Request) =>
  apiHandler(async () => {
    checkOrigin(request);
    const body = await readJson(request);
    if (body.website) throw new ApiError(400, "Pesan tidak dapat dikirim.");
    const data = contactInput(body);
    rateLimit(`contact:${data.email}`, 3);
    rateLimit("contact:global", 100);
    await prisma.contactMessage.create({ data });
    refreshPortfolio();
    return {
      success: true,
      message: "Terima kasih! Pesan Anda sudah diterima.",
    };
  }, 201);
