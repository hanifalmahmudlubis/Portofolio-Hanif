import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { ApiError } from "./api/errors";

export const getAdmin = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });
  return user?.role === "ADMIN" ? user : null;
});
export async function requireAdminPage() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.NEXTAUTH_URL)
    allowed.add(new URL(process.env.NEXTAUTH_URL).origin);
  if (origin && !allowed.has(origin))
    throw new ApiError(403, "Asal permintaan tidak diizinkan.");
}
export async function requireAdmin(request?: Request) {
  if (request && !["GET", "HEAD"].includes(request.method))
    checkOrigin(request);
  const user = await getAdmin();
  if (!user)
    throw new ApiError(401, "Silakan masuk sebagai admin terlebih dahulu.");
  return user;
}
