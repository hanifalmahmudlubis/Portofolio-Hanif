import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { signInApi, sampleProject, png } from "./helpers";

test("public API hides drafts; every administrative read and write is protected", async ({
  request,
  page,
}) => {
  const portfolio = await (await request.get("/api/portfolio")).json();
  expect(portfolio.projects.length).toBeGreaterThan(0);
  expect(
    portfolio.projects.every((item: { published: boolean }) => item.published),
  ).toBe(true);
  for (const url of [
    "/api/admin/projects",
    "/api/admin/dashboard",
    "/api/admin/messages",
  ])
    expect((await request.get(url)).status()).toBe(401);
  for (const url of [
    "/api/projects",
    "/api/experience",
    "/api/certificate",
    "/api/technologies",
  ])
    expect((await request.post(url, { data: {} })).status()).toBe(401);
  for (const url of [
    "/api/projects/missing",
    "/api/experience/missing",
    "/api/certificate/missing",
    "/api/admin/messages/missing",
    "/api/projects/missing/images?imageId=missing",
  ])
    expect((await request.delete(url)).status()).toBe(401);
  expect(
    (
      await request.post("/api/projects/missing/images", { multipart: {} })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.patch("/api/projects/missing/images", {
        data: { imageId: "x" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.patch("/api/admin/messages/missing", {
        data: { isRead: true },
      })
    ).status(),
  ).toBe(401);
  for (const url of [
    "/admin/dashboard",
    "/admin/projects",
    "/admin/projects/new",
    "/admin/experience",
    "/admin/experience/new",
    "/admin/certificate",
    "/admin/certificate/new",
    "/admin/messages",
  ]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  const draft = await request.get("/projects/private-draft");
  // Next.js can already have streamed a loading state before notFound() resolves.
  expect([200, 404]).toContain(draft.status());
  const html = await draft.text();
  expect(html).not.toContain("Private content");
  expect(html).toContain("noindex");
  await page.goto("/projects/private-draft");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

test("non-admin credentials cannot open an admin session", async ({
  request,
}) => {
  await signInApi(request, true);
  expect((await request.get("/api/admin/projects")).status()).toBe(401);
});

test("project CRUD, publication, technology relation, image ownership, cover and cleanup", async ({
  request,
}) => {
  await signInApi(request);
  expect(
    (
      await request.post("/api/projects", {
        data: { ...sampleProject, year: "bad" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/projects", {
        data: { ...sampleProject, githubUrl: "javascript:alert(1)" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/projects", {
        data: sampleProject,
        headers: { Origin: "https://untrusted.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/projects", {
        data: "{bad",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  const technology = await (
    await request.post("/api/technologies", {
      data: { name: "Integration JS", category: "Programming" },
    })
  ).json();
  const createdResponse = await request.post("/api/projects", {
    data: { ...sampleProject, technologyIds: [technology.id] },
  });
  expect(createdResponse.status()).toBe(201);
  const project = await createdResponse.json();
  expect(project.technologies[0].technology.id).toBe(technology.id);
  expect((await request.get(`/api/projects/${project.id}`)).status()).toBe(404);
  expect(
    (await request.post("/api/projects", { data: sampleProject })).status(),
  ).toBe(409);
  expect(
    (
      await request.put(`/api/projects/${project.id}`, {
        data: {
          ...sampleProject,
          title: "Must not persist",
          technologyIds: ["invalid-id"],
        },
      })
    ).status(),
  ).toBe(400);
  const stored = (await (await request.get("/api/admin/projects")).json()).find(
    (item: { id: string }) => item.id === project.id,
  );
  expect(stored.title).toBe(sampleProject.title);
  const other = await (
    await request.post("/api/projects", {
      data: { ...sampleProject, slug: "second-image-owner" },
    })
  ).json();
  expect(
    (
      await request.post(`/api/projects/${project.id}/images`, {
        multipart: {
          images: {
            name: "fake.png",
            mimeType: "image/png",
            buffer: Buffer.from("<html>not image</html>"),
          },
        },
      })
    ).status(),
  ).toBe(400);
  const first = await request.post(`/api/projects/${project.id}/images`, {
    multipart: {
      images: { name: "../../image.png", mimeType: "image/png", buffer: png },
    },
  });
  expect(first.status()).toBe(201);
  const [image1] = await first.json();
  const [image2] = await (
    await request.post(`/api/projects/${project.id}/images`, {
      multipart: {
        images: { name: "second.png", mimeType: "image/png", buffer: png },
      },
    })
  ).json();
  expect(image2.displayOrder).toBeGreaterThan(image1.displayOrder);
  expect(image1.isThumbnail).toBe(true);
  expect(
    (
      await request.delete(
        `/api/projects/${other.id}/images?imageId=${image1.id}`,
      )
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.patch(`/api/projects/${other.id}/images`, {
        data: { imageId: image1.id },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.patch(`/api/projects/${project.id}/images`, {
        data: { imageId: image2.id },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.put(`/api/projects/${project.id}`, {
        data: {
          ...sampleProject,
          published: true,
          featured: true,
          displayOrder: 3,
          technologyIds: [],
        },
      })
    ).status(),
  ).toBe(200);
  const publicProject = await (
    await request.get(`/api/projects/${project.id}`)
  ).json();
  expect(publicProject.published).toBe(true);
  expect(publicProject.featured).toBe(true);
  expect(publicProject.displayOrder).toBe(3);
  expect(publicProject.technologies).toHaveLength(0);
  expect(publicProject.images[0].id).toBe(image2.id);
  expect((await request.get(`/projects/${sampleProject.slug}`)).status()).toBe(
    200,
  );
  expect(
    (
      await request.delete(
        `/api/projects/${project.id}/images?imageId=${image2.id}`,
      )
    ).status(),
  ).toBe(200);
  expect(
    (await (await request.get(`/api/projects/${project.id}`)).json()).images[0]
      .isThumbnail,
  ).toBe(true);
  expect(existsSync(path.join(process.cwd(), "public", image2.imageUrl))).toBe(
    false,
  );
  expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(
    200,
  );
  expect(existsSync(path.join(process.cwd(), "public", image1.imageUrl))).toBe(
    false,
  );
  expect((await request.get(`/api/projects/${project.id}`)).status()).toBe(404);
  expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(
    404,
  );
  expect((await request.delete(`/api/projects/${other.id}`)).status()).toBe(
    200,
  );
});

test("experience CRUD replaces and clears its image relations atomically", async ({
  request,
}) => {
  await signInApi(request);
  const input = {
    company: "Integration Company",
    position: "Developer",
    startDate: "2025-01",
    endDate: "2025-06",
    description: "Built internal tools.",
    images: ["https://example.com/one.png", "https://example.com/two.png"],
  };
  const response = await request.post("/api/experience", { data: input });
  expect(response.status()).toBe(201);
  const experience = await response.json();
  expect(experience.images).toHaveLength(2);
  expect(
    (
      await request.put(`/api/experience/${experience.id}`, {
        data: { ...input, endDate: "2024-01" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (await (await request.get(`/api/experience/${experience.id}`)).json())
      .images,
  ).toHaveLength(2);
  const update = await request.put(`/api/experience/${experience.id}`, {
    data: {
      ...input,
      position: "Updated Developer",
      endDate: "",
      images: ["https://example.com/new.png"],
    },
  });
  expect(update.status()).toBe(200);
  const updated = await update.json();
  expect(updated.endDate).toBe(null);
  expect(updated.images).toHaveLength(1);
  expect(updated.images[0].url).toContain("new.png");
  await request.put(`/api/experience/${experience.id}`, {
    data: { ...input, images: [] },
  });
  expect(
    (await (await request.get(`/api/experience/${experience.id}`)).json())
      .images,
  ).toHaveLength(0);
  expect(
    (await request.delete(`/api/experience/${experience.id}`)).status(),
  ).toBe(200);
  expect((await request.get(`/api/experience/${experience.id}`)).status()).toBe(
    404,
  );
});

test("certificate CRUD validates data and updates the aggregate public API", async ({
  request,
}) => {
  await signInApi(request);
  const data = {
    title: "Integration Certificate",
    issuer: "Testing Academy",
    year: "2026",
    credentialUrl: "https://example.com/credential",
  };
  expect(
    (
      await request.post("/api/certificate", {
        data: { ...data, year: "not-year" },
      })
    ).status(),
  ).toBe(400);
  const response = await request.post("/api/certificate", { data });
  expect(response.status()).toBe(201);
  const certificate = await response.json();
  expect(
    (
      await request.put(`/api/certificate/${certificate.id}`, {
        data: { ...data, title: "Updated Certificate", credentialUrl: "" },
      })
    ).status(),
  ).toBe(200);
  const portfolio = await (await request.get("/api/portfolio")).json();
  expect(
    portfolio.certificates.find(
      (item: { id: string }) => item.id === certificate.id,
    ).title,
  ).toBe("Updated Certificate");
  expect(
    (await request.get(`/api/certificate/${certificate.id}`)).status(),
  ).toBe(200);
  expect(
    (await request.delete(`/api/certificate/${certificate.id}`)).status(),
  ).toBe(200);
  expect(
    (
      await request.put(`/api/certificate/${certificate.id}`, { data })
    ).status(),
  ).toBe(404);
});

test("public contact flows into inbox, unread statistics and read/delete actions", async ({
  request,
}) => {
  const input = {
    name: "Integration Visitor",
    email: "visitor@example.com",
    subject: "A project opportunity",
    message: "Let us build something together.",
  };
  expect(
    (
      await request.post("/api/contact", {
        data: { ...input, email: "invalid" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/contact", {
        data: { ...input, website: "spam" },
      })
    ).status(),
  ).toBe(400);
  const response = await request.post("/api/contact", { data: input });
  expect(response.status()).toBe(201);
  await signInApi(request);
  const messages = await (await request.get("/api/admin/messages")).json();
  const message = messages.find(
    (item: { email: string }) => item.email === input.email,
  );
  expect(message.subject).toBe(input.subject);
  expect(message.isRead).toBe(false);
  const before = await (await request.get("/api/admin/dashboard")).json();
  expect(
    (
      await request.patch(`/api/admin/messages/${message.id}`, {
        data: { isRead: true },
      })
    ).status(),
  ).toBe(200);
  expect(
    (await (await request.get("/api/admin/dashboard")).json()).unreadMessages,
  ).toBe(before.unreadMessages - 1);
  expect(
    (await request.delete(`/api/admin/messages/${message.id}`)).status(),
  ).toBe(200);
});
