export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new RequestError(
      data?.message || "Permintaan gagal. Silakan coba lagi.",
      response.status,
      data?.fields,
    );
  return data as T;
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}
