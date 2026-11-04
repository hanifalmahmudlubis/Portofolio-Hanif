import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_SESSION_IDLE_SECONDS,
  ADMIN_SESSION_MAX_SECONDS,
  adminSessionWindow,
} from "../src/lib/admin-session";
import { rateLimit, resetRateLimit } from "../src/lib/rate-limit";

const now = Date.UTC(2026, 10, 4, 12);
const minute = 60_000;

test("admin sessions end at 15 idle minutes or one hour from login, whichever is earlier", () => {
  assert.equal(ADMIN_SESSION_IDLE_SECONDS, 15 * 60);
  assert.equal(ADMIN_SESSION_MAX_SECONDS, 60 * 60);
  const timing = { signedInAt: now, lastActiveAt: now };
  assert.equal(adminSessionWindow(timing, now)?.expiresAt, now + 15 * minute);
  assert.ok(adminSessionWindow(timing, now + 15 * minute - 1));
  assert.equal(adminSessionWindow(timing, now + 15 * minute), null);
  const active = { signedInAt: now, lastActiveAt: now + 59 * minute };
  assert.equal(
    adminSessionWindow(active, now + 59 * minute)?.expiresAt,
    now + 60 * minute,
  );
  assert.equal(adminSessionWindow(active, now + 60 * minute), null);
});

test("legacy, malformed, and future session timings cannot grant admin access", () => {
  for (const value of [
    {},
    { signedInAt: "today", lastActiveAt: now },
    { signedInAt: NaN, lastActiveAt: now },
    { signedInAt: 0, lastActiveAt: now },
    { signedInAt: now, lastActiveAt: now - 1 },
    { signedInAt: now + 1, lastActiveAt: now + 1 },
    { signedInAt: now, lastActiveAt: Infinity },
  ])
    assert.equal(adminSessionWindow(value, now), null);
});

test("a successful login resets its attempts without removing limits for other accounts", () => {
  const key = "test:login:successful";
  const other = "test:login:blocked";
  try {
    for (let count = 0; count < 12; count++) {
      rateLimit(key, 2);
      resetRateLimit(key);
    }
    rateLimit(other, 2);
    rateLimit(other, 2);
    assert.throws(() => rateLimit(other, 2), /Terlalu banyak percobaan/);
    rateLimit(key, 2);
    rateLimit(key, 2);
    assert.throws(() => rateLimit(key, 2), /Terlalu banyak percobaan/);
  } finally {
    resetRateLimit(key);
    resetRateLimit(other);
  }
});
