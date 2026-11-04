import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { signInApi, signInUi, sampleProject } from "./helpers";
import { pdfText } from "./pdf-text";
import { pdfLayout } from "./pdf-layout";
import type { CvEditorData } from "../src/types/cv";

test("CV routes require admin access and never advertise public CV downloads", async ({
  request,
  page,
}) => {
  for (const endpoint of [
    "/api/admin/cv",
    "/api/admin/cv/pdf",
    "/api/admin/cv/pdf?download=1",
  ])
    expect((await request.get(endpoint)).status()).toBe(401);
  expect((await request.put("/api/admin/cv", { data: {} })).status()).toBe(401);
  await page.goto("/admin/cv");
  await expect(page).toHaveURL(/\/admin\/login/);
  const publicHtml = await (await request.get("/")).text();
  expect(publicHtml).not.toContain("/api/admin/cv");
  expect((await request.get("/cv")).status()).toBe(404);
});

test("CV synchronizes shared content, current projects and exclusions while keeping private fields out of public APIs", async ({
  request,
}, testInfo) => {
  await signInApi(request, "profile");
  const original = (await (
    await request.get("/api/admin/cv")
  ).json()) as CvEditorData;
  const cleanup: string[] = [];
  try {
    const createdProject = await request.post("/api/projects", {
      data: {
        ...sampleProject,
        slug: "cv-synchronization-project",
        title: "CV Synchronization Project",
        year: 2029,
        published: true,
        fullDescription: "Project overview marker. Additional project context.",
        solution:
          "Implemented the integration marker. Improved the workflow marker.",
        githubUrl: "https://github.com/cv-example/removed-from-cv",
        liveDemoUrl: "https://cv-example.test/demo",
      },
    });
    expect(createdProject.status()).toBe(201);
    const project = await createdProject.json();
    cleanup.push(`/api/projects/${project.id}`);
    const createdExperience = await request.post("/api/experience", {
      data: {
        company: "CV Synchronization Company",
        position: "Engineer",
        startDate: "2028-01",
        endDate: "2029-01",
        description:
          "Created reliable publishing APIs. Improved approval workflow marker. Supported deployment marker.",
        employmentType: "Full-time",
      },
    });
    expect(createdExperience.status()).toBe(201);
    const experience = await createdExperience.json();
    cleanup.push(`/api/experience/${experience.id}`);
    const createdCertificate = await request.post("/api/certificate", {
      data: {
        title: "CV Synchronization Certificate",
        issuer: "Test Institute",
        year: "2029",
        issueDate: "2029-06",
        credentialUrl: "https://example.test/credential",
      },
    });
    expect(createdCertificate.status()).toBe(201);
    const certificate = await createdCertificate.json();
    cleanup.push(`/api/certificate/${certificate.id}`);
    const draft = structuredClone(original);
    draft.profile.fullName = "Synchronized CV Engineer";
    draft.profile.phone = "+6281999888777";
    draft.profile.summary =
      "PRIVATE-CV-PROFILE: Experienced engineer building reliable software.";
    draft.profile.email = "synchronized@example.test";
    draft.education.push({
      id: "recent-cv-school",
      institution: "Synchronized Institute",
      degree: "Master of Software Engineering",
      major: "Software Engineering",
      location: "Medan",
      startDate: "2027-01",
      endDate: "2029-01",
      gpa: "4.00",
    });
    draft.skillGroups[0].skills.push("SynchronizedSkill");
    const saved = await request.put("/api/admin/cv", {
      data: {
        ...draft,
        preferences: { ...draft.preferences, breakBeforeProjects: true },
      },
    });
    expect(saved.status()).toBe(200);
    const content = (await saved.json()) as CvEditorData;
    expect(content.education[0].institution).toBe("Synchronized Institute");
    const publicData = await (await request.get("/api/portfolio")).json();
    expect(publicData.profile.fullName).toBe(draft.profile.fullName);
    expect(publicData.profile.email).toBe(draft.profile.email);
    expect(publicData.profile.educationLine).toContain(
      "Synchronized Institute",
    );
    expect(JSON.stringify(publicData)).not.toContain("PRIVATE-CV-PROFILE");
    expect(JSON.stringify(publicData)).not.toContain(draft.profile.phone);
    const publicHtml = await (await request.get("/")).text();
    expect(publicHtml).toContain("SynchronizedSkill");
    expect(publicHtml).not.toContain("PRIVATE-CV-PROFILE");
    expect(publicHtml).not.toContain(draft.profile.phone);
    async function pdf() {
      const response = await request.get("/api/admin/cv/pdf?download=1");
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("application/pdf");
      expect(response.headers()["cache-control"]).toContain(
        "private, no-store",
      );
      expect(response.headers()["content-disposition"]).toContain(
        'attachment; filename="Hanif_Almahmud_Lubis_CV.pdf"',
      );
      return response.body();
    }
    const first = await pdf();
    expect(first.toString("latin1")).toMatch(
      /\/MediaBox\s*\[0 0 595\.\d+ 841\.\d+\]/,
    );
    expect(first.toString("latin1")).toContain(
      "mailto:synchronized@example.test",
    );
    const firstText = pdfText(first);
    expect(firstText.split("\n")[0]).toContain("PROJECTS");
    expect(firstText).not.toContain("Source code");
    expect(first.toString("latin1")).not.toContain(
      "https://github.com/cv-example/removed-from-cv",
    );
    expect(first.toString("latin1")).toContain("https://cv-example.test/demo");
    for (const value of [
      "SYNCHRONIZED CV ENGINEER",
      "Synchronized Institute",
      "CV Synchronization Project",
      "Created reliable publishing APIs.",
      "CV Synchronization Certificate",
      "SynchronizedSkill",
      "Project overview marker.",
      "Implemented the integration marker.",
      "Improved the workflow marker.",
      "Improved approval workflow marker.",
      "Supported deployment marker.",
    ])
      expect(firstText).toContain(value);
    await writeFile(testInfo.outputPath("cv-synchronized.pdf"), first);
    expect(
      (
        await request.put(`/api/projects/${project.id}`, {
          data: {
            ...project,
            title: "Updated CV Project",
            cvHighlights: ["Live database change."],
          },
        })
      ).status(),
    ).toBe(200);
    const updatedText = pdfText(await pdf());
    expect(updatedText).toContain("Updated CV Project");
    expect(updatedText).toContain("Live database change.");
    expect(updatedText).not.toContain("Project overview marker.");
    expect(
      (await (await request.get(`/api/projects/${project.id}`)).json())
        .githubUrl,
    ).toBe(project.githubUrl);
    content.preferences.excludedProjectIds.push(project.id);
    content.preferences.excludedExperienceIds.push(experience.id);
    expect(
      (await request.put("/api/admin/cv", { data: content })).status(),
    ).toBe(200);
    const excludedText = pdfText(await pdf());
    expect(excludedText).not.toContain("Updated CV Project");
    expect(excludedText).not.toContain("CV Synchronization Company");
    expect((await request.get(`/api/projects/${project.id}`)).status()).toBe(
      200,
    );
    const invalid = await request.put("/api/admin/cv", {
      data: { ...content, profile: { ...content.profile, email: "invalid" } },
    });
    expect(invalid.status()).toBe(400);
    expect(
      (await (await request.get("/api/admin/cv")).json()).profile.email,
    ).toBe(draft.profile.email);
    expect(
      (
        await request.put("/api/admin/cv", {
          headers: { origin: "https://untrusted.example" },
          data: content,
        })
      ).status(),
    ).toBe(403);
  } finally {
    expect(
      (await request.put("/api/admin/cv", { data: original })).status(),
    ).toBe(200);
    for (const endpoint of cleanup.reverse()) await request.delete(endpoint);
  }
});

test("admin CV editor saves changes, previews the exact downloaded document, and supports a WebP intro photo", async ({
  page,
}, testInfo) => {
  await signInUi(page, "profile");
  const original = (await (
    await page.request.get("/api/admin/cv")
  ).json()) as CvEditorData;
  try {
    await page.goto("/admin/cv");
    await expect(
      page.getByRole("heading", { name: "CV", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", {
        name: "Mulai bagian proyek pada halaman baru",
      }),
    ).toHaveCount(0);
    await page
      .getByRole("textbox", { name: "Judul profesional *", exact: true })
      .fill("CV Interface Engineer");
    await page
      .getByRole("button", { name: "Simpan perubahan", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Perubahan tersimpan");
    await page
      .getByRole("button", { name: "Pratinjau CV", exact: true })
      .click();
    await expect(
      page.getByRole("img", { name: /^Halaman 1 dari [12]$/ }),
    ).toHaveAttribute("data-rendered", "true", {
      timeout: 60000,
    });
    const preview = await page
      .getByRole("link", { name: "Buka PDF di tab baru", exact: true })
      .getAttribute("href");
    const previewBytes = await page.evaluate(
      async (url) =>
        Array.from(
          new Uint8Array(await (await fetch(url!.split("#")[0])).arrayBuffer()),
        ),
      preview,
    );
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Unduh PDF", exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe("Hanif_Almahmud_Lubis_CV.pdf");
    const chunks: Buffer[] = [];
    for await (const chunk of (await download.createReadStream())!)
      chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks)).toEqual(Buffer.from(previewBytes));
    await download.saveAs(testInfo.outputPath("cv-preview-download.pdf"));
    expect(
      (await (await page.request.get("/api/portfolio")).json()).profile
        .professionalTitle,
    ).toBe("CV Interface Engineer");
    const changedInOtherTab = (await (
      await page.request.get("/api/admin/cv")
    ).json()) as CvEditorData;
    changedInOtherTab.profile.summary += " RemoteUpdateMarkerXYZ";
    expect(
      (
        await page.request.put("/api/admin/cv", { data: changedInOtherTab })
      ).status(),
    ).toBe(200);
    const nextDownloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Unduh PDF", exact: true }).click();
    const nextDownload = await nextDownloadEvent;
    const updatedChunks: Buffer[] = [];
    for await (const chunk of (await nextDownload.createReadStream())!)
      updatedChunks.push(Buffer.from(chunk));
    expect(pdfText(Buffer.concat(updatedChunks))).toContain(
      "RemoteUpdateMarkerXYZ",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("img", { name: /^Halaman 1 dari [12]$/ }),
    ).toHaveAttribute("data-rendered", "true");
    await expect(
      page.getByRole("button", { name: "Unduh PDF", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const canvasPixels = await page
      .getByRole("img", { name: /^Halaman 1 dari [12]$/ })
      .evaluate((canvas: HTMLCanvasElement) => {
        const { data } = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height);
        let ink = 0;
        for (let i = 0; i < data.length; i += 4)
          if (
            data[i] < 100 &&
            data[i + 1] < 100 &&
            data[i + 2] < 100 &&
            data[i + 3] > 200
          )
            ink++;
        return ink;
      });
    expect(canvasPixels).toBeGreaterThan(100);
    await page.screenshot({
      path: testInfo.outputPath("cv-admin-mobile.png"),
      fullPage: true,
    });
    const webp = await sharp({
      create: { width: 32, height: 40, channels: 3, background: "#1a3154" },
    })
      .webp()
      .toBuffer();
    expect(
      (
        await page.request.post("/api/admin/profile", {
          multipart: {
            images: {
              name: "portrait.webp",
              mimeType: "image/webp",
              buffer: webp,
            },
          },
        })
      ).status(),
    ).toBe(200);
    const withPhoto = (await (
      await page.request.get("/api/admin/cv")
    ).json()) as CvEditorData;
    withPhoto.preferences.includePhoto = true;
    expect(
      (await page.request.put("/api/admin/cv", { data: withPhoto })).status(),
    ).toBe(200);
    const photoPdf = await page.request.get("/api/admin/cv/pdf");
    expect(photoPdf.status()).toBe(200);
    const photoBuffer = await photoPdf.body();
    expect(photoBuffer.toString("latin1")).toContain("/Subtype /Image");
    const [withPhotoLayout, withoutPhotoLayout] = await Promise.all([
      pdfLayout(photoBuffer),
      pdfLayout(Buffer.concat(chunks)),
    ]);
    const photoPage = withPhotoLayout[0];
    const name = photoPage.text.find(
      (item) => item.text === withPhoto.profile.fullName.toUpperCase(),
    )!;
    const oldName = withoutPhotoLayout[0].text.find(
      (item) => item.text === withPhoto.profile.fullName.toUpperCase(),
    )!;
    expect(name).toBeTruthy();
    expect(
      Math.abs(name.x + name.width / 2 - photoPage.width / 2),
    ).toBeLessThan(1);
    expect(
      Math.abs(name.x + name.width / 2 - (oldName.x + oldName.width / 2)),
    ).toBeLessThan(1);
    const contact = photoPage.text.find((item) =>
      item.text.includes(withPhoto.profile.email),
    )!;
    const contactLine = photoPage.text.filter(
      (item) => Math.abs(item.y - contact.y) < 0.5,
    );
    const lineLeft = Math.min(...contactLine.map((item) => item.x));
    const lineRight = Math.max(
      ...contactLine.map((item) => item.x + item.width),
    );
    expect(
      Math.abs((lineLeft + lineRight) / 2 - photoPage.width / 2),
    ).toBeLessThan(1);
    await writeFile(testInfo.outputPath("cv-photo-centered.pdf"), photoBuffer);
  } finally {
    await page.request.delete("/api/admin/profile");
    await page.request.put("/api/admin/cv", { data: original });
  }
});

test("CV enforces two pages and recovers when excess content is excluded without changing website content", async ({
  request,
}, testInfo) => {
  await signInApi(request, "profile");
  const original = (await (
    await request.get("/api/admin/cv")
  ).json()) as CvEditorData;
  const cleanup: string[] = [];
  try {
    for (let index = 0; index < 16; index++) {
      const response = await request.post("/api/experience", {
        data: {
          company: `Pagination Company ${index}`,
          position: "Engineer",
          startDate: `${2000 + index}-01`,
          endDate: `${2000 + index}-12`,
          description: "Pagination verification",
          responsibilities: Array.from(
            { length: 3 },
            (_, n) =>
              `Contribution ${index}-${n}: ${"Implemented reliable features and collaborated with the team. ".repeat(2)}`,
          ),
        },
      });
      expect(response.status()).toBe(201);
      cleanup.push(`/api/experience/${(await response.json()).id}`);
    }
    const response = await request.get("/api/admin/cv/pdf");
    expect(response.status()).toBe(422);
    const rejected = await response.json();
    expect(rejected.message).toContain("Maksimal 2 halaman");
    expect(Number(rejected.fields.pageCount)).toBeGreaterThan(2);
    const reduced = structuredClone(original);
    reduced.preferences.excludedExperienceIds.push(
      ...cleanup.slice(0, 15).map((endpoint) => endpoint.split("/").at(-1)!),
    );
    expect(
      (await request.put("/api/admin/cv", { data: reduced })).status(),
    ).toBe(200);
    const valid = await request.get("/api/admin/cv/pdf");
    expect(valid.status()).toBe(200);
    expect(Number(valid.headers()["x-cv-page-count"])).toBeLessThanOrEqual(2);
    const buffer = await valid.body();
    expect(
      [...buffer.toString("latin1").matchAll(/\/Type \/Page\b/g)].length,
    ).toBeLessThanOrEqual(2);
    const text = pdfText(buffer);
    expect(text).toContain("Contribution 15-2:");
    expect(text).toContain("Indonesian: Native");
    expect(
      (await (await request.get("/api/experience")).json()).filter(
        (row: { company: string }) =>
          row.company.startsWith("Pagination Company"),
      ),
    ).toHaveLength(16);
    await writeFile(testInfo.outputPath("cv-two-pages.pdf"), buffer);
  } finally {
    await request.put("/api/admin/cv", { data: original });
    for (const endpoint of cleanup) await request.delete(endpoint);
  }
});
