import { ApiError } from "./error";
/** Bound streamed requests too: Content-Length alone is not a reliable limit. */
export async function readBody(
  request: Pick<Request, "headers" | "body">,
  limit: number,
): Promise<ArrayBuffer> {
  if (Number(request.headers.get("content-length")) > limit)
    throw new ApiError(413, "Data terlalu besar.");
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new ApiError(413, "Data terlalu besar.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}
