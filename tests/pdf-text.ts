import { inflateSync } from "node:zlib";

/** Decode text operators of the standard WinAnsi fonts used by this template. */
export function pdfText(buffer: Buffer) {
  const source = buffer.toString("latin1");
  const pages: string[] = [];
  for (const match of source.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) {
    let decoded = match[1];
    try {
      decoded = inflateSync(Buffer.from(decoded, "latin1")).toString("latin1");
    } catch {
      /* Uncompressed stream. */
    }
    const fragments = [...decoded.matchAll(/<([0-9a-f]+)>/gi)].map((item) =>
      Buffer.from(item[1], "hex").toString("latin1"),
    );
    if (fragments.length) pages.push(fragments.join(""));
  }
  return pages.join("\n");
}
