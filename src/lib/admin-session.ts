export const ADMIN_SESSION_IDLE_SECONDS = 15 * 60;
export const ADMIN_SESSION_MAX_SECONDS = 60 * 60;
export const ADMIN_SESSION_WARNING_SECONDS = 60;

type SessionTiming = {
  signedInAt?: unknown;
  lastActiveAt?: unknown;
};

/** Only server-issued, signed timestamps are used to authorize a session. */
export function adminSessionWindow(timing: SessionTiming, now = Date.now()) {
  const { signedInAt, lastActiveAt } = timing;
  if (
    typeof signedInAt !== "number" ||
    typeof lastActiveAt !== "number" ||
    !Number.isSafeInteger(signedInAt) ||
    !Number.isSafeInteger(lastActiveAt) ||
    signedInAt <= 0 ||
    lastActiveAt < signedInAt ||
    signedInAt > now ||
    lastActiveAt > now
  )
    return null;
  const idleExpiresAt = lastActiveAt + ADMIN_SESSION_IDLE_SECONDS * 1000;
  const absoluteExpiresAt = signedInAt + ADMIN_SESSION_MAX_SECONDS * 1000;
  const expiresAt = Math.min(idleExpiresAt, absoluteExpiresAt);
  return now < expiresAt
    ? { idleExpiresAt, absoluteExpiresAt, expiresAt }
    : null;
}
