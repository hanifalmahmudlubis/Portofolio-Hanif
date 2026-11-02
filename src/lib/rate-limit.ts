import { ApiError } from "./api/errors";
// Per-process protection; replace with a shared store when running multiple instances.
const attempts = new Map<string, { count: number; expires: number }>();
export function rateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  if (attempts.size >= 5000)
    for (const [id, value] of attempts)
      if (value.expires <= now) attempts.delete(id);
  const existing = attempts.get(key);
  if (existing && existing.expires > now) {
    if (existing.count >= limit)
      throw new ApiError(
        429,
        "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
      );
    existing.count++;
  } else {
    if (attempts.size >= 10000)
      throw new ApiError(429, "Layanan sedang sibuk. Silakan coba lagi nanti.");
    attempts.set(key, { count: 1, expires: now + windowMs });
  }
}
