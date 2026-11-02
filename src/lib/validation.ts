import { ApiError } from "./api/errors";
import { safeUrl } from "./urls";
import { normalizeMonth } from "./dates";
type Input = Record<string, unknown>;
function text(input: Input, key: string, required = true, max = 200): string {
  const value = input[key];
  if (value == null && !required) return "";
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  ) {
    throw new ApiError(400, `Periksa kolom ${key}.`, {
      [key]: required
        ? `Wajib diisi, maksimal ${max} karakter.`
        : `Maksimal ${max} karakter.`,
    });
  }
  return value.trim();
}
function integer(input: Input, key: string, min: number, max: number) {
  const value = input[key];
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    value === "" ||
    !Number.isInteger(Number(value)) ||
    Number(value) < min ||
    Number(value) > max
  )
    throw new ApiError(400, `Kolom ${key} harus berupa angka ${min}–${max}.`, {
      [key]: "Angka tidak valid.",
    });
  return Number(value);
}
function flag(input: Input, key: string) {
  if (input[key] === undefined) return undefined;
  if (typeof input[key] !== "boolean")
    throw new ApiError(400, `${key} harus berupa boolean.`);
  return input[key] as boolean;
}
function url(input: Input, key: string) {
  const value = text(input, key, false, 2048);
  if (value && !safeUrl(value))
    throw new ApiError(400, `URL ${key} harus diawali https:// atau http://.`, {
      [key]: "URL tidak valid.",
    });
  return value || null;
}
function stringList(
  input: Input,
  key: string,
  max: number,
): string[] | undefined {
  if (input[key] === undefined) return undefined;
  const value = input[key];
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((item) => typeof item !== "string" || !item.trim())
  )
    throw new ApiError(400, `Daftar ${key} tidak valid (maksimal ${max}).`);
  return [...new Set((value as string[]).map((item) => item.trim()))];
}
export function projectInput(input: Input) {
  const slug = text(input, "slug", true, 180);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new ApiError(
      400,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
      { slug: "Contoh: aplikasi-klinik" },
    );
  const technologyIds = stringList(input, "technologyIds", 30);
  if (technologyIds?.some((id) => id.length > 100))
    throw new ApiError(400, "ID teknologi tidak valid.");
  return {
    title: text(input, "title"),
    slug,
    shortDescription: text(input, "shortDescription", true, 500),
    fullDescription: text(input, "fullDescription", true, 20000),
    category: text(input, "category", true, 100),
    projectType: text(input, "projectType", true, 100),
    year: integer(input, "year", 1990, 2100),
    problem: text(input, "problem", false, 10000) || null,
    solution: text(input, "solution", false, 10000) || null,
    githubUrl: url(input, "githubUrl"),
    liveDemoUrl: url(input, "liveDemoUrl"),
    published: flag(input, "published"),
    featured: flag(input, "featured"),
    displayOrder:
      input.displayOrder === undefined
        ? undefined
        : integer(input, "displayOrder", 0, 10000),
    technologyIds,
  };
}
function dateValue(input: Input, key: string, required: boolean) {
  const value = text(input, key, required, 30);
  if (!value) return null;
  const parsed = normalizeMonth(value);
  if (!parsed)
    throw new ApiError(400, `Tanggal ${key} tidak valid. Gunakan YYYY-MM.`);
  return parsed;
}
export function experienceInput(input: Input) {
  const startDate = dateValue(input, "startDate", true)!;
  const endDate = dateValue(input, "endDate", false);
  if (endDate && endDate < startDate)
    throw new ApiError(400, "Tanggal selesai harus setelah tanggal mulai.");
  const images = stringList(input, "images", 12);
  if (images?.some((image) => !safeUrl(image) || image.length > 2048))
    throw new ApiError(
      400,
      "Setiap gambar pengalaman harus berupa URL http/https yang valid.",
    );
  return {
    company: text(input, "company"),
    position: text(input, "position"),
    location: text(input, "location", false),
    startDate,
    endDate,
    description: text(input, "description", true, 10000),
    images,
  };
}
export function certificateInput(input: Input) {
  return {
    title: text(input, "title"),
    issuer: text(input, "issuer"),
    year: String(integer(input, "year", 1990, 2100)),
    credentialUrl: url(input, "credentialUrl"),
  };
}
export function technologyInput(input: Input) {
  return {
    name: text(input, "name", true, 60),
    category: text(input, "category", true, 80),
  };
}
export function contactInput(input: Input) {
  const email = text(input, "email", true, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(400, "Alamat email tidak valid.", {
      email: "Masukkan alamat email yang valid.",
    });
  return {
    name: text(input, "name", true, 100),
    email,
    subject: text(input, "subject", true, 200),
    message: text(input, "message", true, 5000),
  };
}
