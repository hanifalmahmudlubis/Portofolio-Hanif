import test from "node:test";
import assert from "node:assert/strict";
import {
  projectInput,
  experienceInput,
  certificateInput,
  contactInput,
} from "../src/lib/validation";
import { safeUrl, imageUrl } from "../src/lib/urls";
import { ApiError, readJson } from "../src/lib/api/errors";
import { prepareImages, persistImages } from "../src/lib/uploads";
import { MAX_IMAGE_SIZE, MAX_UPLOAD_BODY } from "../src/lib/upload-config";
const project = {
  title: "Project",
  slug: "my-project",
  shortDescription: "Summary",
  fullDescription: "Description",
  category: "Web",
  projectType: "Personal",
  year: 2026,
};
test("project validation normalizes input and preserves publication flags and technology relations", () => {
  const data = projectInput({
    ...project,
    title: " Project ",
    year: "2026",
    published: true,
    featured: true,
    technologyIds: ["a", "a", "b"],
  });
  assert.equal(data.title, "Project");
  assert.equal(data.year, 2026);
  assert.equal(data.published, true);
  assert.deepEqual(data.technologyIds, ["a", "b"]);
  assert.equal(projectInput(project).published, undefined);
});
test("rejects invalid project slugs, required fields, years and boolean coercion", () => {
  for (const override of [
    { slug: "../admin" },
    { title: "  " },
    { year: "not-a-year" },
    { year: 2026.5 },
    { published: "false" },
    { technologyIds: "x" },
  ])
    assert.throws(() => projectInput({ ...project, ...override }), ApiError);
});
test("rejects unsafe or credential-bearing external URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//evil.test",
    "https://user:password@example.com",
  ]) {
    assert.equal(safeUrl(url), undefined);
    assert.throws(() => projectInput({ ...project, githubUrl: url }), ApiError);
  }
  assert.equal(
    safeUrl("https://github.com/example"),
    "https://github.com/example",
  );
  assert.equal(imageUrl("/uploads/projects/a.png"), "/uploads/projects/a.png");
  assert.equal(imageUrl("/uploads/projects/../../.env"), undefined);
});
test("experience dates are normalized; updates can deliberately clear images", () => {
  const data = experienceInput({
    company: "Company",
    position: "Engineer",
    startDate: "Sep 2024",
    endDate: "Dec 2024",
    description: "Work",
    images: [],
  });
  assert.equal(data.startDate, "2024-09");
  assert.equal(data.endDate, "2024-12");
  assert.deepEqual(data.images, []);
  assert.throws(
    () => experienceInput({ ...data, endDate: "2024-01" }),
    ApiError,
  );
  assert.throws(
    () => experienceInput({ ...data, startDate: "2024-13" }),
    ApiError,
  );
});
test("certificate year and contact email are validated before database access", () => {
  assert.throws(
    () => certificateInput({ title: "Course", issuer: "Issuer", year: "oops" }),
    ApiError,
  );
  assert.throws(
    () =>
      contactInput({
        name: "Name",
        email: "not-an-email",
        subject: "Subject",
        message: "Hi",
      }),
    ApiError,
  );
  assert.equal(
    contactInput({
      name: "Name",
      email: "ME@EXAMPLE.COM",
      subject: "Subject",
      message: "Hi",
    }).email,
    "me@example.com",
  );
});
test("API rejects malformed JSON, arrays and oversized input", async () => {
  for (const body of [
    "{broken",
    "[]",
    JSON.stringify({ value: "x".repeat(128001) }),
  ])
    await assert.rejects(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }),
      ),
      ApiError,
    );
});
test("uploads reject spoofed image content and oversized files", async () => {
  for (const file of [
    new File(["<script>alert(1)</script>"], "fake.png", { type: "image/png" }),
    new File([new Uint8Array(MAX_IMAGE_SIZE + 1)], "big.png", {
      type: "image/png",
    }),
  ]) {
    const form = new FormData();
    form.append("images", file);
    await assert.rejects(
      prepareImages(
        new Request("http://localhost", { method: "POST", body: form }),
      ),
      ApiError,
    );
  }
});
test("multipart uploads stay below the Vercel payload limit", async () => {
  assert.ok(MAX_UPLOAD_BODY < 4_500_000);
  const buffer = Buffer.alloc(MAX_IMAGE_SIZE);
  buffer.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const form = new FormData();
  form.append(
    "images",
    new File([buffer], "maximum.png", { type: "image/png" }),
  );
  const result = await prepareImages(
    new Request("http://localhost", { method: "POST", body: form }),
  );
  assert.equal(result[0].buffer.length, MAX_IMAGE_SIZE);
  form.append("images", new File([buffer], "extra.png", { type: "image/png" }));
  await assert.rejects(
    prepareImages(
      new Request("http://localhost", { method: "POST", body: form }),
    ),
    (error: unknown) => error instanceof ApiError && error.status === 413,
  );
});

test("Vercel without Blob configuration never falls back to writing local files", async () => {
  const originalVercel = process.env.VERCEL;
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.VERCEL = "1";
  delete process.env.BLOB_READ_WRITE_TOKEN;
  try {
    await assert.rejects(
      persistImages([]),
      (error: unknown) => error instanceof ApiError && error.status === 503,
    );
  } finally {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  }
});
test("uploaded file names are generated independently of user-supplied paths", async () => {
  const form = new FormData();
  form.append(
    "images",
    new File(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf1sAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      "../../escape.png",
      { type: "image/png" },
    ),
  );
  const [file] = await prepareImages(
    new Request("http://localhost", { method: "POST", body: form }),
  );
  assert.match(file.name, /^[0-9a-f-]+\.png$/);
  assert.equal(file.url, `/uploads/projects/${file.name}`);
});
