import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { renderToBuffer } from "@react-pdf/renderer";
import CvDocument from "../components/cv/CvDocument";
import { ApiError } from "./api/error";
import { readBody } from "./api/body";
import type { CvDocumentData } from "../types/cv";
import { CV_LIMITS } from "./cv-config";

async function photoBuffer(url: string): Promise<Buffer> {
  if (url === "/profile.jpg")
    return readFile(path.join(process.cwd(), "public", "profile.jpg"));
  const local =
    /^\/uploads\/profile\/([a-f0-9-]+\.(?:png|jpg|jpeg|webp|gif))$/i.exec(url);
  if (local) {
    const directory = process.env.VERCEL ? "portfolio" : "uploads/profile";
    try {
      return await readFile(
        path.join(process.cwd(), "public", directory, local[1]),
      );
    } catch {
      return readFile(
        path.join(process.cwd(), "public", "portfolio", local[1]),
      );
    }
  }
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(parsed.hostname) ||
    !/^\/profile\/[a-f0-9-]+\.(png|jpg|jpeg|webp|gif)$/i.test(parsed.pathname)
  ) {
    throw new ApiError(
      400,
      "Foto CV harus menggunakan foto intro yang diunggah dari admin",
    );
  }
  const response = await fetch(parsed, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Photo fetch failed");
  return Buffer.from(await readBody(response, 4 * 1024 * 1024));
}

export async function generateCvPdf(input: CvDocumentData) {
  let photo: string | undefined;
  if (input.preferences.includePhoto && input.photo) {
    try {
      const buffer = await photoBuffer(input.photo);
      const image = await sharp(buffer, {
        limitInputPixels: 25000000,
        animated: false,
      })
        .rotate()
        .resize({ width: 280, height: 360, fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer();
      photo = `data:image/jpeg;base64,${image.toString("base64")}`;
    } catch {
      throw new ApiError(
        422,
        "Foto intro belum dapat dimuat ke CV. Periksa fotonya atau nonaktifkan foto pada pengaturan CV",
      );
    }
  }
  let pageCount = 0;
  const buffer = await renderToBuffer(
    <CvDocument
      data={{ ...input, photo }}
      onPageCount={(pages) => {
        pageCount = Math.max(pageCount, pages);
      }}
    />,
  );
  if (pageCount < 1)
    throw new ApiError(
      503,
      "Jumlah halaman CV belum dapat diperiksa, silakan coba lagi",
    );
  if (pageCount > CV_LIMITS.pages)
    throw new ApiError(
      422,
      `CV masih menjadi ${pageCount} halaman. Maksimal ${CV_LIMITS.pages} halaman. Ringkas profil dan poin kontribusi, atau kurangi konten pada tab Isi CV`,
      { pageCount: String(pageCount) },
    );
  return { buffer, pageCount };
}
