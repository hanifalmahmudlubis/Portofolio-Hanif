import { test, expect, type APIRequestContext } from "@playwright/test";
import { signInApi, signInUi } from "./helpers";

const resetHeaders = () => ({
  origin: process.env.TEST_BASE_URL!,
  "x-session-reset": "1",
});

async function failedLogin(request: APIRequestContext, email: string) {
  const csrf = await (await request.get("/api/auth/csrf")).json();
  const response = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken: csrf.csrfToken,
      email,
      password: "incorrect-password",
      callbackUrl: `${process.env.TEST_BASE_URL}/admin/dashboard`,
      json: "true",
    },
  });
  const result = await response.json();
  return new URL(result.url).searchParams.get("error");
}

test("session reset is available without authentication and clears only auth cookies, including stale chunks", async ({
  context,
}) => {
  await context.addCookies(
    [
      "next-auth.session-token",
      "next-auth.session-token.0",
      "next-auth.session-token.1",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "next-auth.pkce.code_verifier",
      "next-auth.state",
      "next-auth.nonce",
      "portfolio-preference",
      "next-auth.unrelated",
    ].map((name) => ({
      name,
      value: "stale-cookie",
      url: process.env.TEST_BASE_URL!,
      httpOnly: true,
    })),
  );
  expect((await context.request.get("/api/auth/reset-session")).status()).toBe(
    405,
  );
  const response = await context.request.post("/api/auth/reset-session", {
    headers: resetHeaders(),
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const remaining = (await context.cookies()).map(({ name }) => name).sort();
  expect(remaining).toEqual(["next-auth.unrelated", "portfolio-preference"]);
  const expired = response
    .headersArray()
    .filter(({ name }) => name.toLowerCase() === "set-cookie")
    .map(({ value }) => value);
  expect(
    expired.some((cookie) => cookie.startsWith("next-auth.session-token.1=")),
  ).toBe(true);
  expect(
    expired.some(
      (cookie) =>
        cookie.startsWith("__Host-next-auth.csrf-token=") &&
        cookie.includes("Secure") &&
        cookie.includes("Max-Age=0") &&
        cookie.includes("Path=/"),
    ),
  ).toBe(true);
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    401,
  );
});

test("session reset rejects cross-site requests and requests without its origin or custom header", async ({
  context,
}) => {
  await signInApi(context.request, "profile");
  const invalidHeaders: Record<string, string>[] = [
    { origin: "https://untrusted.example", "x-session-reset": "1" },
    { "x-session-reset": "1" },
    { origin: process.env.TEST_BASE_URL! },
    { ...resetHeaders(), "sec-fetch-site": "cross-site" },
  ];
  for (const headers of invalidHeaders) {
    const response = await context.request.post("/api/auth/reset-session", {
      headers,
    });
    expect(response.status()).toBe(403);
    expect(response.headers()["set-cookie"]).toBeUndefined();
  }
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    200,
  );
});

test("the recovery page resets this browser across tabs, works on mobile, and allows a fresh login", async ({
  context,
  page,
}, testInfo) => {
  await signInApi(context.request, "profile");
  const other = await context.newPage();
  await other.goto("/admin/dashboard");
  await expect(
    other.getByRole("heading", { name: "Ringkasan", exact: true }),
  ).toBeVisible();
  await page.goto("/admin/session");
  await expect(
    page.getByRole("heading", { name: "Sesi browser", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Sesi aktif", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("admin-session-reset-mobile.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Hapus sesi browser ini", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/login\?reason=reset/);
  await expect(
    page.getByRole("status").filter({ hasText: "Sesi browser telah dihapus" }),
  ).toBeVisible();
  await expect(other).toHaveURL(/\/admin\/login/);
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    401,
  );
  await signInUi(page, "profile");
  expect((await context.request.get("/api/admin/dashboard")).status()).toBe(
    200,
  );
  await other.close();
});

test("successful credentials use the verified session and a fixed local path even when the callback URL differs", async ({
  page,
}) => {
  await page.route("**/api/auth/callback/credentials", async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    const body = await response.json();
    await route.fulfill({
      response,
      json: { ...body, url: "https://another-origin.example/admin/dashboard" },
    });
  });
  await signInUi(page, "profile");
  expect(new URL(page.url()).origin).toBe(process.env.TEST_BASE_URL);
  expect((await page.request.get("/api/admin/dashboard")).status()).toBe(200);
});

test("login explains throttling separately and clearing cookies cannot bypass the failed-login limit", async ({
  context,
  page,
}) => {
  const email = "session-reset-blocked@portfolio.test";
  for (let count = 0; count < 10; count++)
    expect(await failedLogin(context.request, email)).toBe("CredentialsSignin");
  expect(await failedLogin(context.request, email)).toBe("LoginRateLimited");
  expect(
    (
      await context.request.post("/api/auth/reset-session", {
        headers: resetHeaders(),
      })
    ).status(),
  ).toBe(200);
  expect(await failedLogin(context.request, email)).toBe("LoginRateLimited");
  await page.goto("/admin/login");
  await page.getByLabel("Email admin").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Terlalu banyak percobaan login" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Hapus sesi browser", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sesi browser", exact: true }),
  ).toBeVisible();
});
