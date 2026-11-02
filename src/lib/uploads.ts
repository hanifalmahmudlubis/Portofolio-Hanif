import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { ApiError } from "./api/errors";
import { readBody } from "./api/body";
import {
  MAX_IMAGE_SIZE,
  MAX_UPLOAD_BODY,
  MAX_UPLOAD_COUNT,
} from "./upload-config";

const uploadRoot = path.resolve(process.cwd(), "public", "uploads", "projects");
function imageExtension(buffer: Buffer) {
  if (
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "jpg";
  if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString()))
    return "gif";
  if (
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  )
    return "webp";
  throw new ApiError(
    400,
    "Gambar harus berupa PNG, JPEG, WebP, atau GIF yang valid.",
  );
}
export async function prepareImages(request: Request) {
  const payload = await readBody(request, MAX_UPLOAD_BODY);
  let form: FormData;
  try {
    form = await new Response(payload, {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
  } catch {
    throw new ApiError(400, "Form unggahan tidak valid.");
  }
  const files = form.getAll("images");
  if (!files.length || files.length > MAX_UPLOAD_COUNT)
    throw new ApiError(400, "Pilih 1 sampai 8 gambar per unggahan.");
  return Promise.all(
    files.map(async (file) => {
      if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_SIZE)
        throw new ApiError(
          400,
          "Setiap gambar maksimal 4 MB dan tidak boleh kosong.",
        );
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = `${randomUUID()}.${imageExtension(buffer)}`;
      return { buffer, name, url: `/uploads/projects/${name}` };
    }),
  );
}
export async function persistImages(
  images: Awaited<ReturnType<typeof prepareImages>>,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (process.env.VERCEL && !token)
    throw new ApiError(
      503,
      "Penyimpanan gambar belum dikonfigurasi. Hubungkan Vercel Blob pada project ini.",
    );
  try {
    if (token) {
      for (const image of images) {
        const blob = await put(`projects/${image.name}`, image.buffer, {
          access: "public",
          addRandomSuffix: false,
          token,
        });
        image.url = blob.url;
      }
    } else {
      await mkdir(uploadRoot, { recursive: true });
      for (const image of images)
        await writeFile(path.join(uploadRoot, image.name), image.buffer, {
          flag: "wx",
        });
    }
  } catch (error) {
    await Promise.all(images.map((image) => removeUpload(image.url)));
    throw error;
  }
}
export async function removeUpload(url: string) {
  if (url.startsWith("https://")) {
    const location = new URL(url);
    if (
      !location.hostname.endsWith(".public.blob.vercel-storage.com") ||
      !/^\/projects\/[0-9a-f-]+\.(png|jpg|webp|gif)$/.test(location.pathname)
    )
      return;
    if (!process.env.BLOB_READ_WRITE_TOKEN) return;
    try {
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      console.error("Could not remove unused cloud upload.");
    }
    return;
  }
  // Legacy static assets bundled with a deployment cannot be unlinked.
  if (process.env.VERCEL) return;
  if (!url.startsWith("/uploads/projects/")) return;
  const name = url.slice("/uploads/projects/".length);
  const target = path.resolve(uploadRoot, name);
  if (!name || path.dirname(target) !== uploadRoot) return;
  try {
    await unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      console.error("Could not remove unused project upload.");
  }
}
