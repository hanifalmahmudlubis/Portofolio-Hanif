import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { BlobError, del, put } from "@vercel/blob";
import { ApiError } from "./api/errors";
import { readBody } from "./api/body";
import { hasBlobStorage } from "./blob-config";
import {
  MAX_IMAGE_SIZE,
  MAX_UPLOAD_BODY,
  MAX_UPLOAD_COUNT,
} from "./upload-config";

const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
type Collection = "projects" | "profile";
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
export async function prepareImages(
  request: Request,
  collection: Collection = "projects",
) {
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
      return {
        buffer,
        name,
        collection,
        url: `/uploads/${collection}/${name}`,
      };
    }),
  );
}
export async function persistImages(
  images: Awaited<ReturnType<typeof prepareImages>>,
) {
  const cloudStorage = hasBlobStorage();
  if (process.env.VERCEL && !cloudStorage)
    throw new ApiError(
      503,
      "Penyimpanan gambar belum dikonfigurasi. Hubungkan Public Blob store ke environment Vercel yang digunakan, lalu redeploy project.",
    );
  try {
    if (cloudStorage) {
      for (const image of images) {
        const blob = await put(
          `${image.collection}/${image.name}`,
          image.buffer,
          {
            access: "public",
            addRandomSuffix: false,
          },
        );
        image.url = blob.url;
      }
    } else {
      for (const image of images) {
        const directory = path.join(uploadRoot, image.collection);
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, image.name), image.buffer, {
          flag: "wx",
        });
      }
    }
  } catch (error) {
    await Promise.all(images.map((image) => removeUpload(image.url)));
    if (error instanceof BlobError)
      throw new ApiError(
        503,
        "Upload gambar gagal. Periksa koneksi Public Blob store dan izin environment deployment di Vercel, lalu coba lagi.",
      );
    throw error;
  }
}
export async function removeUpload(url: string) {
  if (url.startsWith("https://")) {
    const location = new URL(url);
    if (
      !location.hostname.endsWith(".public.blob.vercel-storage.com") ||
      !/^\/(projects|profile)\/[0-9a-f-]+\.(png|jpg|webp|gif)$/.test(
        location.pathname,
      )
    )
      return;
    if (!hasBlobStorage()) return;
    try {
      await del(url);
    } catch {
      console.error("Could not remove unused cloud upload.");
    }
    return;
  }
  // Legacy static assets bundled with a deployment cannot be unlinked.
  if (process.env.VERCEL) return;
  const local = /^\/uploads\/(projects|profile)\/(.+)$/.exec(url);
  if (!local) return;
  const directory = path.join(uploadRoot, local[1]);
  const target = path.resolve(directory, local[2]);
  if (path.dirname(target) !== directory) return;
  try {
    await unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      console.error("Could not remove unused project upload.");
  }
}
