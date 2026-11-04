import { test, expect } from "@playwright/test";
import { signInUi, png } from "./helpers";
test("an upload failure preserves the saved project and retry does not duplicate it", async ({
  page,
}) => {
  await signInUi(page);
  let uploadRequests = 0;
  await page.route("**/api/projects/*/images", async (route) => {
    if (route.request().method() === "POST" && ++uploadRequests === 2) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Temporary upload failure" }),
      });
    } else await route.continue();
  });
  await page.goto("/admin/projects/new");
  await page
    .getByRole("textbox", { name: /^Judul proyek/ })
    .fill("Recoverable upload project");
  await page
    .getByRole("combobox", { name: "Kategori *", exact: true })
    .fill("Web Development");
  await page
    .getByRole("textbox", { name: "Jenis proyek *", exact: true })
    .fill("Personal Project");
  await page
    .getByRole("textbox", { name: "Ringkasan *", exact: true })
    .fill("Upload retry test.");
  await page
    .getByRole("textbox", { name: "Deskripsi lengkap *", exact: true })
    .fill("A failed upload must not create duplicate projects.");
  await page.locator('input[type="file"]:visible').setInputFiles([
    { name: "first-success.png", mimeType: "image/png", buffer: png },
    {
      name: "broken.png",
      mimeType: "image/png",
      buffer: png,
    },
  ]);
  await page
    .getByRole("button", { name: "Simpan proyek", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Proyek sudah tersimpan" }),
  ).toBeVisible();
  const before = await (await page.request.get("/api/admin/projects")).json();
  expect(
    before.filter(
      (project: { slug: string }) =>
        project.slug === "recoverable-upload-project",
    ),
  ).toHaveLength(1);
  const partiallySaved = before.find(
    (project: { slug: string }) =>
      project.slug === "recoverable-upload-project",
  );
  expect(partiallySaved.images).toHaveLength(1);
  await page
    .getByRole("button", { name: "Simpan proyek", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/projects\?saved=1/);
  const after = await (await page.request.get("/api/admin/projects")).json();
  const matches = after.filter(
    (project: { slug: string }) =>
      project.slug === "recoverable-upload-project",
  );
  expect(matches).toHaveLength(1);
  expect(matches[0].images).toHaveLength(2);
  expect(uploadRequests).toBe(3);
  expect(
    matches[0].images.some(
      (image: { id: string }) => image.id === partiallySaved.images[0].id,
    ),
  ).toBe(true);
  await page.request.delete(`/api/projects/${matches[0].id}`);
});

test("inbox UI receives, marks and deletes a public contact message", async ({
  page,
}) => {
  await signInUi(page);
  await page.request.post("/api/contact", {
    data: {
      name: "Inbox visitor",
      email: "inbox@example.com",
      subject: "UI inbox verification",
      message: "This message should appear in the admin workspace.",
    },
  });
  await page.goto("/admin/messages");
  const message = page
    .getByRole("article")
    .filter({ hasText: "UI inbox verification" });
  await expect(message).toBeVisible();
  await message
    .getByRole("button", { name: "Tandai dibaca", exact: true })
    .click();
  await expect(
    message.getByRole("button", { name: "Tandai belum dibaca", exact: true }),
  ).toBeVisible();
  await message
    .getByRole("button", { name: "Hapus UI inbox verification" })
    .click();
  await page.getByRole("button", { name: "Ya, hapus", exact: true }).click();
  await expect(message).toHaveCount(0);
});
test("desktop public pages render, filter projects and link to the requested profiles", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Hanif Al Mahmud Lubis",
    }),
  ).toBeVisible();
  for (const id of [
    "intro",
    "projects",
    "experience",
    "skills",
    "certificates",
    "contact",
  ])
    await expect(page.getByRole("main").locator(`#${id}`)).toBeAttached();
  expect(
    await page
      .getByRole("main")
      .locator(":scope > section")
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual([
    "intro",
    "projects",
    "experience",
    "skills",
    "certificates",
    "contact",
  ]);
  await expect(page.locator(".particle-canvas")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link"),
  ).toHaveText([
    "Intro",
    "Projects",
    "Experience",
    "Skills",
    "Certificates",
    "Contact",
  ]);
  await expect(
    page
      .getByRole("link", { name: "GitHub repositories", exact: true })
      .first(),
  ).toHaveAttribute(
    "href",
    "https://github.com/hanifalmahmudlubis?tab=repositories",
  );
  await expect(
    page.getByRole("link", { name: "LinkedIn profile", exact: true }).first(),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/hanifalmahmudlubis/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Machine Learning", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "SKTM Eligibility Recommendation System",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Clinic Management Mobile Application",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByLabel("Search projects").fill("not-a-real-project");
  await expect(page.getByText("No projects found.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("link", {
      name: "View project: SKTM Eligibility Recommendation System",
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "SKTM Eligibility Recommendation System",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub repositories", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://github.com/hanifalmahmudlubis?tab=repositories",
  );
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/detail-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  expect(errors).toEqual([]);
});

test("mobile navigation, responsive layout and contact form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
    caret: "initial",
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page.getByLabel("Your name").fill("Mobile visitor");
  await page.getByLabel("Email address").fill("mobile@example.com");
  await page.getByLabel("Subject", { exact: true }).fill("Hello from mobile");
  await page
    .getByLabel("Your message")
    .fill("A message submitted from the mobile layout.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Message received", exact: true }),
  ).toBeVisible();
});

test("admin project UI supports create, upload, publication, edit, gallery and delete", async ({
  page,
}) => {
  await signInUi(page);
  await expect(
    page.getByRole("heading", { name: "Ringkasan", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".particle-canvas")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/admin-dashboard.png",
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/admin/projects/new");
  await page.getByLabel("Judul proyek").fill("UI workflow project");
  await expect(page.getByLabel("Slug", { exact: false })).toHaveValue(
    "ui-workflow-project",
  );
  await page
    .getByLabel("Kategori", { exact: false })
    .first()
    .fill("Web Development");
  await page.getByLabel("Jenis proyek").fill("Personal Project");
  await page.getByLabel("Ringkasan").fill("Created through the admin form.");
  await page
    .getByLabel("Deskripsi lengkap")
    .fill("A full browser workflow verifies saving and publication.");
  await page.getByRole("checkbox", { name: "Publikasikan proyek" }).check();
  await page.getByRole("checkbox", { name: "Proyek unggulan" }).check();
  await page.getByRole("checkbox", { name: "Python", exact: true }).check();
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.png", mimeType: "image/png", buffer: png },
    { name: "second.png", mimeType: "image/png", buffer: png },
  ]);
  await page
    .getByRole("button", { name: "Simpan proyek", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/projects\?saved=1/);
  const row = page.getByRole("row").filter({ hasText: "UI workflow project" });
  await expect(row.getByText("Dipublikasikan", { exact: true })).toBeVisible();
  await row.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Publikasikan proyek" }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Python", exact: true }),
  ).toBeChecked();
  await page.getByLabel("Judul proyek").fill("Updated UI workflow project");
  await page.getByRole("button", { name: "Jadikan sampul" }).click();
  await page
    .getByRole("button", { name: "Simpan proyek", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/projects\?saved=1/);
  await page.clock.install({ time: new Date("2026-11-02T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-02T00:00:01Z"));
  await page.goto("/projects/ui-workflow-project");
  await expect(
    page.getByRole("heading", {
      name: "Updated UI workflow project",
      exact: true,
    }),
  ).toBeVisible();
  const gallery = page.getByRole("region", {
    name: "Updated UI workflow project gallery",
    exact: true,
  });
  await expect(gallery.getByText("01 / 02", { exact: true })).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.runFor(4_999);
  await expect(gallery.getByText("01 / 02", { exact: true })).toBeVisible();
  await page.clock.runFor(1);
  await expect(gallery.getByText("02 / 02", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pause slideshow" }).click();
  await page.clock.runFor(5_000);
  await expect(gallery.getByText("02 / 02", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Next screenshot", exact: true })
    .click();
  await expect(gallery.getByText("01 / 02", { exact: true })).toBeVisible();
  await page.clock.runFor(400);
  await page.getByRole("button", { name: "Expand project screenshot" }).click();
  await expect(
    page.getByRole("dialog", { name: "Project screenshot viewer" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Project screenshot viewer" }),
  ).not.toBeVisible();
  await page.clock.resume();
  await page.goto("/admin/projects");
  await page
    .getByRole("button", { name: "Hapus Updated UI workflow project" })
    .click();
  await page.getByRole("button", { name: "Ya, hapus", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Updated UI workflow project" }),
  ).toHaveCount(0);
});

test("experience and certificate admin forms create, update and delete without nested actions", async ({
  page,
}) => {
  await signInUi(page);
  await page.goto("/admin/experience/new");
  await page
    .getByRole("textbox", { name: /^Posisi \/ jabatan/ })
    .fill("UI test engineer");
  await page
    .getByRole("textbox", { name: /^Perusahaan \/ organisasi/ })
    .fill("UI test company");
  await page
    .getByLabel("Mulai", { exact: false })
    .filter({ visible: true })
    .fill("2025-01");
  await page
    .getByLabel("Selesai", { exact: false })
    .filter({ visible: true })
    .fill("2025-03");
  await page
    .getByRole("textbox", { name: /^Deskripsi & kontribusi/ })
    .fill("A complete form submission.");
  await page.getByRole("button", { name: "Simpan pengalaman" }).click();
  await expect(page).toHaveURL(/\/admin\/experience\?saved=1/);
  await page
    .getByRole("row")
    .filter({ hasText: "UI test engineer" })
    .getByRole("link", { name: "Edit", exact: true })
    .click();
  await expect(
    page.getByLabel("Mulai", { exact: false }).filter({ visible: true }),
  ).toHaveValue("2025-01");
  await page
    .getByRole("textbox", { name: /^Posisi \/ jabatan/ })
    .fill("Updated UI engineer");
  await page.getByRole("button", { name: "Simpan pengalaman" }).click();
  await page.getByRole("button", { name: "Hapus Updated UI engineer" }).click();
  await page.getByRole("button", { name: "Ya, hapus", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Updated UI engineer" }),
  ).toHaveCount(0);
  await page.goto("/admin/certificate/new");
  await page
    .getByRole("textbox", { name: /^Judul sertifikat/ })
    .fill("UI test certificate");
  await page.getByRole("textbox", { name: /^Penerbit/ }).fill("UI test issuer");
  await page.getByRole("button", { name: "Simpan sertifikat" }).click();
  await expect(page).toHaveURL(/\/admin\/certificate\?saved=1/);
  await page
    .getByRole("row")
    .filter({ hasText: "UI test certificate" })
    .getByRole("link", { name: "Edit", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: /^Judul sertifikat/ })
    .fill("Updated UI certificate");
  await page.getByRole("button", { name: "Simpan sertifikat" }).click();
  await page
    .getByRole("button", { name: "Hapus Updated UI certificate" })
    .click();
  await page.getByRole("button", { name: "Ya, hapus", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Updated UI certificate" }),
  ).toHaveCount(0);
});

test("mobile admin navigation and sign out work; login displays invalid credentials", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/login");
  await page.screenshot({
    path: "test-results/login-mobile.png",
    fullPage: true,
    caret: "initial",
  });
  await page.getByLabel("Email admin").fill("unknown@example.com");
  await page.getByLabel("Password", { exact: true }).fill("invalid-password");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Email atau password" }),
  ).toBeVisible();
  await signInUi(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Buka navigasi admin" }).click();
  await page
    .getByRole("navigation", { name: "Navigasi admin" })
    .getByRole("link", { name: "Sertifikat" })
    .click();
  await expect(page).toHaveURL(/\/admin\/certificate/);
  await page.screenshot({
    path: "test-results/admin-mobile.png",
    fullPage: true,
    caret: "initial",
  });
  await page.getByRole("button", { name: "Buka navigasi admin" }).click();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
