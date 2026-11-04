import { ApiError } from "./error";

export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.NEXTAUTH_URL)
    allowed.add(new URL(process.env.NEXTAUTH_URL).origin);
  if (origin && !allowed.has(origin))
    throw new ApiError(403, "Asal permintaan tidak diizinkan.");
}
