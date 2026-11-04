import { NextRequest, NextResponse } from "next/server";
import { checkOrigin } from "@/lib/api/origin";

const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie, Origin",
};
const authCookie =
  /^(?:__Secure-|__Host-)?next-auth\.(?:session-token|csrf-token|callback-url|pkce\.code_verifier|state|nonce)(?:\.\d+)?$/;

export async function POST(request: NextRequest) {
  // This reset must work without a valid JWT, CSRF cookie, or database connection.
  // A required custom header plus an explicit same-origin check prevents logout CSRF.
  if (
    request.headers.get("x-session-reset") !== "1" ||
    !request.headers.get("origin") ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return NextResponse.json(
      { message: "Permintaan penghapusan sesi tidak diizinkan" },
      { status: 403, headers },
    );
  try {
    checkOrigin(request);
  } catch {
    return NextResponse.json(
      { message: "Asal permintaan tidak diizinkan" },
      { status: 403, headers },
    );
  }

  const response = NextResponse.json(
    { message: "Sesi browser telah dihapus" },
    { headers },
  );
  const names = new Set([
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    ...request.cookies
      .getAll()
      .filter(({ name }) => authCookie.test(name))
      .map(({ name }) => name),
  ]);
  for (const name of names)
    response.cookies.set(name, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure:
        request.nextUrl.protocol === "https:" ||
        name.startsWith("__Secure-") ||
        name.startsWith("__Host-"),
      expires: new Date(0),
      maxAge: 0,
    });
  return response;
}
