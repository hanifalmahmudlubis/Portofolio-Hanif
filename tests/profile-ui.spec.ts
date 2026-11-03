import { test, expect } from "@playwright/test";
import { png, signInUi } from "./helpers";

test("admin intro photo editor previews, saves and resets the public portrait", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signInUi(page, "profile");
  await page
    .getByRole("navigation", { name: "Navigasi admin" })
    .getByRole("link", { name: "Foto intro" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Foto intro", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/admin-profile.png",
    fullPage: true,
    caret: "initial",
  });
  await page.getByLabel("Pilih foto intro").setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(page.getByAltText("Pratinjau foto intro")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await page
    .getByRole("button", { name: "Simpan foto intro", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Foto intro berhasil diperbarui",
  );
  const photo = await (await page.request.get("/api/admin/profile")).json();
  await page.reload();
  await expect(page.getByAltText("Foto intro saat ini")).toHaveAttribute(
    "src",
    photo.introImageUrl,
  );
  await page.goto("/");
  await expect(
    page.getByAltText("Hanif Al Mahmud Lubis", { exact: true }),
  ).toHaveAttribute("src", photo.introImageUrl);
  await page.goto("/admin/profile");
  await page.getByRole("button", { name: "Gunakan foto awal" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Foto awal digunakan kembali",
  );
  await page.goto("/");
  await expect(
    page.getByAltText("Hanif Al Mahmud Lubis", { exact: true }),
  ).toHaveAttribute("src", "/profile.jpg");
});

test("header marks the visible section, deep links and project routes on desktop and mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  for (const [id, label] of [
    ["intro", "Intro"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["skills", "Skills"],
    ["certificates", "Certificates"],
    ["contact", "Contact"],
  ]) {
    await page
      .locator(`#${id}`)
      .evaluate((element) =>
        element.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    await expect(
      navigation.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "location");
    await expect(navigation.locator("[aria-current]")).toHaveCount(1);
  }
  await page.goto("/projects");
  await expect(
    navigation.getByRole("link", { name: "Projects", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/#skills");
  await expect(
    navigation.getByRole("link", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await page.setViewportSize({ width: 390, height: 844 });
  // Resizing reflows the cards, so establish the visible section on mobile.
  await page
    .locator("#skills")
    .evaluate((section) =>
      section.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await expect(
    page.locator('nav[aria-label="Main navigation"] a[href="/#skills"]'),
  ).toHaveAttribute("aria-current", "location");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobile = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(
    mobile.getByRole("link", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await mobile.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(mobile).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    mobile.getByRole("link", { name: "Contact", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await page.screenshot({
    path: "test-results/nav-mobile-active.png",
    fullPage: false,
    caret: "initial",
  });
});
