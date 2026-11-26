"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

export type CropArea = { x: number; y: number; width: number; height: number };

export const cropShapes = [
  { key: "square", label: "Kotak", ratio: 1 },
  { key: "portrait", label: "Potret 4:5", ratio: 4 / 5 },
  { key: "original", label: "Asli", ratio: null },
] as const;
export type CropShape = (typeof cropShapes)[number]["key"];

const MAX_ZOOM = 4;
// Portraits keep the face: start slightly above the middle.
const START = { x: 0.5, y: 0.38 };
const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(1, value));

/**
 * Pan-and-zoom cropper: the frame is fixed and the photo moves underneath it.
 * State is the crop centre (as a fraction of the photo) plus zoom, so the view
 * survives frame resizes; the visible area is reported in natural pixels.
 * Remount it (via `key`) for a new photo or shape.
 */
export default function PhotoCropper({
  src,
  alt,
  shape,
  onCrop,
}: {
  src: string;
  alt: string;
  shape: CropShape;
  onCrop: (area: CropArea | null) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(
    null,
  );
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [space, setSpace] = useState(440);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState(START);

  const ratio =
    cropShapes.find((item) => item.key === shape)?.ratio ??
    (natural ? natural.w / natural.h : 1);
  const frameWidth = Math.min(space, 440, 520 * ratio);
  const box = { w: frameWidth, h: frameWidth / ratio };

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setSpace(Math.max(160, element.clientWidth - 32)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Everything below is derived from the photo size, frame size, zoom and centre.
  const scale = natural
    ? Math.max(box.w / natural.w, box.h / natural.h) * zoom
    : 1;
  const view = natural
    ? (() => {
        const visibleW = box.w / scale;
        const visibleH = box.h / scale;
        const cx = Math.min(
          natural.w - visibleW / 2,
          Math.max(visibleW / 2, center.x * natural.w),
        );
        const cy = Math.min(
          natural.h - visibleH / 2,
          Math.max(visibleH / 2, center.y * natural.h),
        );
        return {
          x: Math.round(cx - visibleW / 2),
          y: Math.round(cy - visibleH / 2),
          width: Math.max(1, Math.round(visibleW)),
          height: Math.max(1, Math.round(visibleH)),
          offsetX: box.w / 2 - cx * scale,
          offsetY: box.h / 2 - cy * scale,
          cx: cx / natural.w,
          cy: cy / natural.h,
        };
      })()
    : null;

  const cropX = view?.x;
  const cropY = view?.y;
  const cropW = view?.width;
  const cropH = view?.height;
  useEffect(() => {
    onCrop(
      cropX === undefined ||
        cropY === undefined ||
        cropW === undefined ||
        cropH === undefined
        ? null
        : { x: cropX, y: cropY, width: cropW, height: cropH },
    );
  }, [cropX, cropY, cropW, cropH, onCrop]);

  // Wheel zoom needs a non-passive listener so the page does not scroll as well.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
      setZoom((value) => clampZoom(value * factor));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  function moveBy(dx: number, dy: number) {
    if (!natural || !view) return;
    setCenter({
      x: view.cx - dx / scale / natural.w,
      y: view.cy - dy / scale / natural.h,
    });
  }

  return (
    <div className="cropper">
      <div ref={stage} className="cropper-stage">
        <div
          ref={frame}
          className="cropper-frame"
          style={{ width: box.w, height: box.h }}
          tabIndex={0}
          role="group"
          aria-label="Area crop foto. Geser dengan mouse atau tombol panah."
          onPointerDown={(event) => {
            if (!view) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              cx: view.cx,
              cy: view.cy,
            };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || !natural) return;
            setCenter({
              x: start.cx - (event.clientX - start.x) / scale / natural.w,
              y: start.cy - (event.clientY - start.y) / scale / natural.h,
            });
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 40 : 10;
            const moves: Record<string, [number, number]> = {
              ArrowLeft: [step, 0],
              ArrowRight: [-step, 0],
              ArrowUp: [0, step],
              ArrowDown: [0, -step],
            };
            const move = moves[event.key];
            if (!move) return;
            event.preventDefault();
            moveBy(move[0], move[1]);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview positioned by hand */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            onLoad={(event) =>
              setNatural({
                w: event.currentTarget.naturalWidth || 1,
                h: event.currentTarget.naturalHeight || 1,
              })
            }
            style={
              natural && view
                ? {
                    width: natural.w * scale,
                    height: natural.h * scale,
                    transform: `translate(${view.offsetX}px, ${view.offsetY}px)`,
                  }
                : { width: "100%", height: "100%", objectFit: "cover" }
            }
          />
          <span className="cropper-grid" aria-hidden="true" />
        </div>
      </div>
      <div className="cropper-controls">
        <label className="field flex-1">
          Zoom
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(clampZoom(Number(event.target.value)))}
            className="cropper-range"
          />
        </label>
        <button
          type="button"
          className="admin-action self-end"
          onClick={() => {
            setZoom(1);
            setCenter(START);
          }}
        >
          <RotateCcw size={14} /> Atur ulang
        </button>
      </div>
    </div>
  );
}

/** Draws the chosen area to a new file, capped at 1600px on the longest side. */
export async function cropFile(
  file: File,
  url: string,
  area: CropArea | null,
): Promise<File> {
  if (!area) return file;
  const image = new window.Image();
  image.src = url;
  await image.decode();
  const factor = Math.min(1, 1600 / Math.max(area.width, area.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width * factor));
  canvas.height = Math.max(1, Math.round(area.height * factor));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  // Keep transparency for PNG/WebP; GIF frames are flattened to PNG.
  const type =
    file.type === "image/jpeg"
      ? "image/jpeg"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/png";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92),
  );
  if (!blob) return file;
  const extension = type.split("/")[1].replace("jpeg", "jpg");
  const name = `${file.name.replace(/\.[^.]+$/, "") || "intro"}.${extension}`;
  return new File([blob], name, { type });
}
