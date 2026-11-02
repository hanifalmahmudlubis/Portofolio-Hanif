import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { png, sampleProject, signInApi } from "./helpers";

test("intro photo persists, publishes, rejects invalid replacements and cleans up on reset", async ({
  request,
}) => {
  await signInApi(request, "profile");
  const endpoint = "/api/admin/profile";
  expect((await (await request.get(endpoint)).json()).introImageUrl).toBe(
    "/profile.jpg",
  );
  try {
    const upload = await request.post(endpoint, {
      multipart: {
        images: { name: "intro.png", mimeType: "image/png", buffer: png },
      },
    });
    expect(upload.status()).toBe(200);
    const first = (await upload.json()).introImageUrl;
    expect(first).toMatch(/^\/uploads\/profile\/[0-9a-f-]+\.png$/);
    expect(
      (await (await request.get("/api/portfolio")).json()).introImageUrl,
    ).toBe(first);
    expect(await (await request.get("/")).text()).toContain(first);
    const invalid = await request.post(endpoint, {
      multipart: {
        images: {
          name: "fake.png",
          mimeType: "image/png",
          buffer: Buffer.from("not image data"),
        },
      },
    });
    expect(invalid.status()).toBe(400);
    expect((await (await request.get(endpoint)).json()).introImageUrl).toBe(
      first,
    );
    const batch = new FormData();
    batch.append("images", new File([png], "one.png", { type: "image/png" }));
    batch.append("images", new File([png], "two.png", { type: "image/png" }));
    expect((await request.post(endpoint, { multipart: batch })).status()).toBe(
      400,
    );
    const replacement = await request.post(endpoint, {
      multipart: {
        images: { name: "replacement.png", mimeType: "image/png", buffer: png },
      },
    });
    expect(replacement.status()).toBe(200);
    const second = (await replacement.json()).introImageUrl;
    expect(second).not.toBe(first);
    expect(existsSync(path.join(process.cwd(), "public", first))).toBe(false);
    expect((await (await request.get(endpoint)).json()).introImageUrl).toBe(
      second,
    );
    expect((await request.delete(endpoint)).status()).toBe(200);
    expect(existsSync(path.join(process.cwd(), "public", second))).toBe(false);
    expect(
      (await (await request.get("/api/portfolio")).json()).introImageUrl,
    ).toBe("/profile.jpg");
    expect(existsSync(path.join(process.cwd(), "public", "profile.jpg"))).toBe(
      true,
    );
  } finally {
    await request.delete(endpoint);
  }
});

test("date-based content remains newest first regardless of entry order or manual priority", async ({
  request,
}) => {
  await signInApi(request, "profile");
  const cleanup: string[] = [];
  try {
    async function create(endpoint: string, data: object) {
      const response = await request.post(endpoint, { data });
      expect(response.status()).toBe(201);
      const value = await response.json();
      cleanup.push(`${endpoint}/${value.id}`);
      return value;
    }
    const latest = await create("/api/projects", {
      ...sampleProject,
      slug: "chronology-latest",
      year: 2030,
      published: true,
      displayOrder: 9999,
    });
    await create("/api/projects", {
      ...sampleProject,
      slug: "chronology-old",
      year: 2001,
      published: true,
      featured: true,
      displayOrder: 0,
    });
    for (const endpoint of ["/api/projects", "/api/admin/projects"]) {
      const projects = await (await request.get(endpoint)).json();
      expect(projects[0].id).toBe(latest.id);
      expect(
        projects.every(
          (project: { year: number }, index: number) =>
            index === 0 || projects[index - 1].year >= project.year,
        ),
      ).toBe(true);
    }
    expect(
      (await (await request.get("/api/admin/dashboard")).json())
        .recentProjects[0].id,
    ).toBe(latest.id);
    const experience = {
      company: "Chronology company",
      description: "Chronology test",
    };
    const ongoing = await create("/api/experience", {
      ...experience,
      position: "Ongoing",
      startDate: "2022-01",
      endDate: "",
    });
    const recent = await create("/api/experience", {
      ...experience,
      position: "Recently completed",
      startDate: "2026-01",
      endDate: "2026-10",
    });
    const old = await create("/api/experience", {
      ...experience,
      position: "Older but entered last",
      startDate: "2010-01",
      endDate: "2010-12",
    });
    const experiences = await (await request.get("/api/experience")).json();
    expect(experiences[0].id).toBe(ongoing.id);
    expect(experiences[1].id).toBe(recent.id);
    expect(experiences[experiences.length - 1].id).toBe(old.id);
    const newestCertificate = await create("/api/certificate", {
      title: "Newest chronology certificate",
      issuer: "Chronology issuer",
      year: "2029",
    });
    await create("/api/certificate", {
      title: "Older certificate entered last",
      issuer: "Chronology issuer",
      year: "2001",
    });
    expect((await (await request.get("/api/certificate")).json())[0].id).toBe(
      newestCertificate.id,
    );
  } finally {
    for (const endpoint of cleanup.reverse()) await request.delete(endpoint);
  }
});
