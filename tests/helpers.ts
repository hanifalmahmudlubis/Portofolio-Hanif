import { expect, type APIRequestContext, type Page } from "@playwright/test";
export async function signInApi(request: APIRequestContext, viewer = false) {
  const csrf = await (await request.get("/api/auth/csrf")).json();
  const response = await request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken: csrf.csrfToken,
      email: process.env[viewer ? "TEST_VIEWER_EMAIL" : "TEST_ADMIN_EMAIL"]!,
      password:
        process.env[viewer ? "TEST_VIEWER_PASSWORD" : "TEST_ADMIN_PASSWORD"]!,
      callbackUrl: `${process.env.TEST_BASE_URL}/admin/dashboard`,
      json: "true",
    },
  });
  if (viewer) expect(response.status()).toBe(401);
  else expect(response.ok()).toBeTruthy();
  return response;
}
export async function signInUi(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email admin").fill(process.env.TEST_ADMIN_EMAIL!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
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
