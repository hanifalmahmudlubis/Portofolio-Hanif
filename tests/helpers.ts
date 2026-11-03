import { expect, type APIRequestContext, type Page } from "@playwright/test";
export async function signInApi(
  request: APIRequestContext,
  account: boolean | "profile" = false,
) {
  const prefix =
    account === true
      ? "TEST_VIEWER"
      : account === "profile"
        ? "TEST_PROFILE_ADMIN"
        : "TEST_ADMIN";
  const csrf = await (await request.get("/api/auth/csrf")).json();
  const response = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken: csrf.csrfToken,
      email: process.env[`${prefix}_EMAIL`]!,
      password: process.env[`${prefix}_PASSWORD`]!,
      callbackUrl: `${process.env.TEST_BASE_URL}/admin/dashboard`,
      json: "true",
    },
  });
  if (account === true) expect(response.status()).toBe(401);
  else expect(response.ok()).toBeTruthy();
  return response;
}
export async function signInUi(
  page: Page,
  account: "admin" | "profile" = "admin",
) {
  const prefix = account === "profile" ? "TEST_PROFILE_ADMIN" : "TEST_ADMIN";
  await page.goto("/admin/login");
  await page.getByLabel("Email admin").fill(process.env[`${prefix}_EMAIL`]!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env[`${prefix}_PASSWORD`]!);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(/\/admin\/dashboard/, { waitUntil: "load" });
  await expect(
    page.getByRole("heading", { name: "Ringkasan", exact: true }),
  ).toBeVisible();
}
export const sampleProject = {
  title: "API integration project",
  slug: "api-integration-project",
  shortDescription: "An integration test",
  fullDescription: "A detailed integration test project.",
  category: "Web Development",
  projectType: "Personal Project",
  year: 2026,
  published: false,
  featured: false,
};
export const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf1sAAAAASUVORK5CYII=",
  "base64",
);
