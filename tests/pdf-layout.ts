import type { TextItem } from "pdfjs-dist/types/src/display/api";
import path from "node:path";

export async function pdfLayout(buffer: Buffer) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: new Uint8Array(buffer),
    useWasm: false,
    standardFontDataUrl:
      path
        .join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts")
        .split(path.sep)
        .join("/") + "/",
  });
  const document = await task.promise;
  try {
    const pages = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const { items } = await page.getTextContent();
      pages.push({
        width: page.view[2] - page.view[0],
        height: page.view[3] - page.view[1],
        text: items
          .filter((item): item is TextItem => "str" in item)
          .filter((item) => item.str.trim())
          .map((item) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
          })),
      });
    }
    return pages;
  } finally {
    await task.destroy();
  }
}
