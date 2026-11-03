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
import { compareExperienceDates } from "../src/lib/dates";
import { createServer } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { removeUpload } from "../src/lib/uploads";
const project = {
  title: "Project",
  slug: "my-project",
  shortDescription: "Summary",
  fullDescription: "Description",
  category: "Web",
  projectType: "Personal",
  year: 2026,
};

test("experience chronology handles legacy months, ongoing work and date ties", () => {
  const periods = [
    { id: "legacy", startDate: "Sep 2024", endDate: "Dec 2024" },
    { id: "latest-end", startDate: "2025-02", endDate: "2026-02" },
    { id: "ongoing-old", startDate: "2021-01", endDate: null },
    { id: "ongoing-new", startDate: "2026-01", endDate: null },
    { id: "same-end", startDate: "2024-01", endDate: "2026-02" },
  ];
  assert.deepEqual(
    periods.sort(compareExperienceDates).map((period) => period.id),
    ["ongoing-new", "ongoing-old", "latest-end", "same-end", "legacy"],
  );
});
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
  const originalStore = process.env.BLOB_STORE_ID;
  const originalOidc = process.env.VERCEL_OIDC_TOKEN;
  process.env.VERCEL = "1";
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.VERCEL_OIDC_TOKEN;
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
    if (originalStore === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = originalStore;
    if (originalOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN;
    else process.env.VERCEL_OIDC_TOKEN = originalOidc;
  }
});

test("cloud uploads and cleanup work with static tokens and Vercel OIDC credentials", async () => {
  const keys = [
    "VERCEL",
    "BLOB_READ_WRITE_TOKEN",
    "BLOB_STORE_ID",
    "VERCEL_OIDC_TOKEN",
    "VERCEL_BLOB_API_URL",
  ];
  const originals = keys.map((key) => [key, process.env[key]] as const);
  const contextSymbol = Symbol.for("@vercel/request-context");
  const globals = globalThis as typeof globalThis & Record<symbol, unknown>;
  const originalContext = globals[contextSymbol];
  try {
    for (const mode of ["static", "oidc-env", "oidc-context"]) {
      const requests: {
        authorization: string | undefined;
        storeId: string | undefined;
        method: string | undefined;
      }[] = [];
      const name = "00000000-0000-4000-8000-000000000001.png";
      const blobUrl = `https://unitstore.public.blob.vercel-storage.com/profile/${name}`;
      const server = createServer(async (request, response) => {
        for await (const chunk of request) {
          void chunk;
        }
        requests.push({
          authorization: request.headers.authorization,
          storeId: request.headers["x-vercel-blob-store-id"] as
            string | undefined,
          method: request.method,
        });
        response.setHeader("Content-Type", "application/json");
        response.end(
          JSON.stringify(
            request.method === "PUT"
              ? {
                  url: blobUrl,
                  downloadUrl: blobUrl,
                  pathname: `profile/${name}`,
                  contentType: "image/png",
                  contentDisposition: "inline",
                }
              : {},
          ),
        );
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      try {
        process.env.VERCEL = "1";
        process.env.VERCEL_BLOB_API_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
        process.env.BLOB_READ_WRITE_TOKEN =
          mode === "static" ? "vercel_blob_rw_unitstore_test" : "";
        process.env.BLOB_STORE_ID = "store_unitstore";
        process.env.VERCEL_OIDC_TOKEN =
          mode === "oidc-env" ? "test-oidc-token" : "";
        if (mode === "oidc-context")
          globals[contextSymbol] = {
            get: () => ({
              headers: { "x-vercel-oidc-token": "test-oidc-token" },
            }),
          };
        else delete globals[contextSymbol];
        const files = [
          {
            buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
            name,
            collection: "profile" as const,
            url: `/uploads/profile/${name}`,
          },
        ];
        await persistImages(files);
        assert.equal(files[0].url, blobUrl, mode);
        await removeUpload(files[0].url);
        assert.equal(
          requests.length,
          2,
          `${mode}: upload and cleanup both reached Blob`,
        );
        assert.equal(requests[0].method, "PUT");
        const expectedToken =
          mode === "static"
            ? "vercel_blob_rw_unitstore_test"
            : "test-oidc-token";
        for (const request of requests) {
          assert.equal(request.authorization, `Bearer ${expectedToken}`, mode);
          assert.equal(request.storeId, "unitstore", mode);
        }
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    }
  } finally {
    for (const [key, value] of originals) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (originalContext === undefined) delete globals[contextSymbol];
    else globals[contextSymbol] = originalContext;
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
