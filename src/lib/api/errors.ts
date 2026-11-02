import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ApiError } from "./error";
import { readBody } from "./body";
export { ApiError } from "./error";
export async function apiHandler(action: () => Promise<unknown>, status = 200) {
  try {
    return NextResponse.json(await action(), {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiError)
      return NextResponse.json(
        { message: error.message, fields: error.fields },
        { status: error.status },
      );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        return NextResponse.json(
          { message: "Data sudah digunakan. Pilih slug yang berbeda." },
          { status: 409 },
        );
      if (error.code === "P2025")
        return NextResponse.json(
          { message: "Data tidak ditemukan." },
          { status: 404 },
        );
      if (error.code === "P2003")
        return NextResponse.json(
          {
            message: "Data terkait tidak ditemukan. Muat ulang dan coba lagi.",
          },
          { status: 400 },
        );
    }
    console.error(
      "Portfolio API error:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      { message: "Layanan data sedang tidak tersedia. Silakan coba lagi." },
      { status: 503 },
    );
  }
}
export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Gunakan Content-Type application/json.");
  const raw = new TextDecoder().decode(await readBody(request, 128_000));
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Format JSON tidak valid.");
  }
}
