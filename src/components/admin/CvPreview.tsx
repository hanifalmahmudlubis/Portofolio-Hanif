"use client";

import { useEffect, useRef, useState } from "react";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  RenderTask,
} from "pdfjs-dist";

function PdfPage({
  document,
  number,
  width,
}: {
  document: PDFDocumentProxy;
  number: number;
  width: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    let stopped = false;
    let task: RenderTask | undefined;
    async function render() {
      try {
        const page = await document.getPage(number);
        if (stopped || !canvas.current) return;
        const viewport = page.getViewport({
          scale: width / page.getViewport({ scale: 1 }).width,
        });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.current.width = Math.floor(viewport.width * ratio);
        canvas.current.height = Math.floor(viewport.height * ratio);
        canvas.current.style.width = `${Math.floor(viewport.width)}px`;
        canvas.current.style.height = `${Math.floor(viewport.height)}px`;
        task = page.render({
          canvas: canvas.current,
          viewport,
          transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
        });
        await task.promise;
        if (!stopped) {
          setRenderedWidth(width);
          setError(false);
        }
      } catch {
        if (!stopped) setError(true);
      }
    }
    void render();
    return () => {
      stopped = true;
      task?.cancel();
    };
  }, [document, number, width]);
  return (
    <div className="cv-rendered-page">
      <canvas
        ref={canvas}
        role="img"
        aria-label={`Halaman ${number} dari ${document.numPages}`}
        data-rendered={renderedWidth === width}
      />
      {error && (
        <p role="alert" className="notice notice-error">
          Halaman {number} belum dapat ditampilkan. Gunakan tautan Buka PDF di
          tab baru
        </p>
      )}
      <p className="muted text-center text-xs mt-3">Halaman {number}</p>
    </div>
  );
}

export default function CvPreview({ blob }: { blob: Blob }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState(280);
  const [zoom, setZoom] = useState("fit");
  const pages = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stopped = false;
    let task: PDFDocumentLoadingTask | undefined;
    async function open() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const data = new Uint8Array(await blob.arrayBuffer());
        if (stopped) return;
        task = pdfjs.getDocument({
          data,
          useSystemFonts: true,
          useWasm: false,
        });
        const result = await task.promise;
        if (!stopped) setDocument(result);
      } catch {
        if (!stopped) setError(true);
      }
    }
    void open();
    return () => {
      stopped = true;
      void task?.destroy();
    };
  }, [blob]);
  useEffect(() => {
    if (!pages.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(120, Math.floor(entry.contentRect.width))),
    );
    observer.observe(pages.current);
    return () => observer.disconnect();
  }, []);
  const pageWidth =
    zoom === "fit" ? Math.min(width, 794) : (794 * Number(zoom)) / 100;
  return (
    <div className="cv-document-viewer" aria-label="Pratinjau CV">
      <div className="cv-viewer-controls">
        <p className="muted text-sm" role="status">
          {document
            ? `${document.numPages} halaman`
            : error
              ? "Pratinjau belum tersedia"
              : "Memuat pratinjau…"}
        </p>
        <label className="text-sm">
          Zoom{" "}
          <select
            aria-label="Zoom pratinjau CV"
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
          >
            <option value="fit">Sesuai layar</option>
            <option value="100">100%</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="notice notice-error">
          Pratinjau belum dapat dimuat. Anda tetap dapat membuka PDF di tab baru
          atau mengunduhnya
        </p>
      )}
      <div className="cv-viewer-scroll">
        <div
          ref={pages}
          className="cv-viewer-pages"
          style={zoom === "fit" ? undefined : { minWidth: pageWidth + 40 }}
        >
          {document &&
            Array.from({ length: document.numPages }, (_, index) => (
              <PdfPage
                key={index}
                document={document}
                number={index + 1}
                width={pageWidth}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
