import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
export const GET = (request: Request) =>
  apiHandler(async () => {
    await requireAdmin(request);
    return prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  });
