import { test, expect, type BrowserContext } from "@playwright/test";
import { decode, encode, type JWT } from "next-auth/jwt";
import { signInApi } from "./helpers";

const minute = 60_000;

async function installSession(
  context: BrowserContext,
  timing: { signedInAt?: number; lastActiveAt?: number },
) {
  await signInApi(context.request, "profile");
  const { cookies } = await context.storageState();
  const cookie = cookies.find(
    (item) => item.name === "next-auth.session-token",
  )!;
  expect(cookie).toBeTruthy();
  const token = await decode({
    token: cookie.value,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  expect(token?.id).toBeTruthy();
  await context.addCookies([
    {
      ...cookie,
      value: await encode({
        token: { ...token, ...timing },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 3600,
      }),
    },
  ]);
  return token as JWT;
}

async function updateSession(
  context: BrowserContext,
  data: Record<string, unknown>,
) {
  const csrf = await (await context.request.get("/api/auth/csrf")).json();
  const response = await context.request.post("/api/auth/session", {
    data: { csrfToken: csrf.csrfToken, data },
  });
  expect(response.ok()).toBe(true);
  return response.json();
}

test("session reads stay passive and explicit activity cannot change the login time or identity", async ({
  context,
}) => {
  const now = Date.now();
  const signedInAt = now - 40 * minute;
  const lastActiveAt = now - 10 * minute;
  const original = await installSession(context, { signedInAt, lastActiveAt });
  const first = await (await context.request.get("/api/auth/session")).json();
  const second = await (await context.request.get("/api/auth/session")).json();
  expect(first.idleExpiresAt).toBe(lastActiveAt + 15 * minute);
  expect(second.idleExpiresAt).toBe(first.idleExpiresAt);
  const changed = await updateSession(context, {
    activity: true,
    signedInAt: Date.now(),
    lastActiveAt: Date.now() + 999 * minute,
    absoluteExpiresAt: Date.now() + 999 * minute,
    user: { id: "changed", role: "VIEWER" },
  });
  expect(changed.user.id).toBe(original.id);
  expect(changed.user.role).toBe("ADMIN");
  expect(changed.absoluteExpiresAt).toBe(signedInAt + 60 * minute);
  expect(changed.idleExpiresAt).toBeGreaterThanOrEqual(now + 15 * minute);
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    200,
  );
});

test("idle, absolute, and legacy sessions are rejected server side and activity cannot revive them", async ({
  context,
  page,
}) => {
  for (const timing of [
    {
      signedInAt: Date.now() - 30 * minute,
      lastActiveAt: Date.now() - 16 * minute,
    },
    { signedInAt: Date.now() - 61 * minute, lastActiveAt: Date.now() - minute },
    { signedInAt: undefined, lastActiveAt: undefined },
  ]) {
    await installSession(context, timing);
    expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
      401,
    );
    expect((await context.request.get("/api/admin/cv/pdf")).status()).toBe(401);
    expect(
      (await context.request.post("/api/projects", { data: {} })).status(),
    ).toBe(401);
    const updated = await updateSession(context, {
      activity: true,
      signedInAt: Date.now(),
      lastActiveAt: Date.now(),
    });
    expect(updated.error).toBe("SessionExpired");
    expect(updated.user).toBeUndefined();
    expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
      401,
    );
  }
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin activity renews the idle window across tabs and preserves unsaved form content", async ({
  context,
  page,
}) => {
  const now = Date.now();
  const signedInAt = now - 30 * minute;
  await installSession(context, {
    signedInAt,
    lastActiveAt: now - 14 * minute - 20_000,
  });
  await page.goto("/admin/dashboard");
  const notice = page
    .getByRole("status")
    .filter({ hasText: "Sesi akan berakhir" });
  await expect(notice).toBeVisible();
  const other = await context.newPage();
  await other.goto("/admin/projects/new");
  await expect(
    other.getByRole("status").filter({ hasText: "Sesi akan berakhir" }),
  ).toBeVisible();
  const title = other.getByRole("textbox", { name: /^Judul proyek/ });
  await title.fill("Unsaved session activity draft");
  await expect(notice).toBeHidden();
  await expect(title).toHaveValue("Unsaved session activity draft");
  const current = await (await context.request.get("/api/auth/session")).json();
  expect(current.idleExpiresAt).toBeGreaterThan(now + 14 * minute);
  expect(current.absoluteExpiresAt).toBe(signedInAt + 60 * minute);
  await other.close();
});

test("an idle admin tab warns and returns to login with the session cookie removed", async ({
  context,
  page,
}) => {
  const now = Date.now();
  await installSession(context, {
    signedInAt: now - 30 * minute,
    lastActiveAt: now - 15 * minute + 8000,
  });
  await page.goto("/admin/dashboard");
  await expect(
    page.getByRole("status").filter({ hasText: "Sesi akan berakhir" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login\?reason=expired/, {
    timeout: 20_000,
  });
  await expect(
    page.getByRole("status").filter({ hasText: "Sesi telah berakhir" }),
  ).toBeVisible();
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    401,
  );
  expect(
    (await context.cookies()).some(
      (item) => item.name === "next-auth.session-token",
    ),
  ).toBe(false);
});

test("activity cannot extend the one-hour login deadline and the UI also signs out", async ({
  context,
  page,
}) => {
  const now = Date.now();
  const signedInAt = now - 60 * minute + 8000;
  await installSession(context, { signedInAt, lastActiveAt: now });
  await page.goto("/admin/dashboard");
  await expect(
    page.getByRole("status").filter({ hasText: "Batas 1 jam hampir tercapai" }),
  ).toBeVisible();
  await page.mouse.move(600, 300);
  const renewed = await updateSession(context, { activity: true });
  expect(renewed.absoluteExpiresAt).toBe(signedInAt + 60 * minute);
  await expect(page).toHaveURL(/\/admin\/login\?reason=expired/, {
    timeout: 20_000,
  });
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    401,
  );
});

test("successful logins do not accumulate towards the failed login limit", async ({
  context,
}) => {
  for (let attempt = 0; attempt < 12; attempt++)
    await signInApi(context.request);
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    200,
  );
});
