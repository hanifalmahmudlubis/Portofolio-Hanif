"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, Pause, Play, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { imageUrl } from "@/lib/urls";

type GalleryImage = { id: string; imageUrl: string; caption?: string | null };
const INTERVAL = 5_000;
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ProjectSlider({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const validImages = useMemo(
    () => images.filter((image) => imageUrl(image.imageUrl)),
    [images],
  );
  const [index, setIndex] = useState(0);
  const [playback, setPlayback] = useState<"auto" | "play" | "pause">("auto");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    reducedMotionSnapshot,
    () => false,
  );
  const playing = playback === "play" || (playback === "auto" && !reduced);
  const running =
    playing &&
    !hovered &&
    !focused &&
    !expanded &&
    !hidden &&
    validImages.length > 1;
  const activeIndex = validImages.length ? index % validImages.length : 0;

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    update();
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setIndex((value) => (value + 1) % validImages.length);
    }, INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, index, validImages.length]);

  if (!validImages.length) return null;
  const selected = validImages[activeIndex];
  const previous = () =>
    setIndex((value) => (value - 1 + validImages.length) % validImages.length);
  const next = () => setIndex((value) => (value + 1) % validImages.length);

  return (
    <section
      aria-label={`${title} gallery`}
      aria-roledescription="carousel"
      className="project-gallery"
      onFocusCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-playback]"))
          setFocused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (dialog.current?.open) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
      }}
    >
      <div
        className="gallery-stage relative aspect-[4/3] overflow-hidden rounded-xl border border-border md:aspect-[16/9]"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") touchStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (touchStart.current === null) return;
          const distance = event.clientX - touchStart.current;
          if (Math.abs(distance) > 45) {
            if (distance > 0) previous();
            else next();
          }
          touchStart.current = null;
        }}
        onPointerCancel={() => {
          touchStart.current = null;
        }}
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : -18 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={selected.imageUrl}
              alt={
                selected.caption || `${title} — screenshot ${activeIndex + 1}`
              }
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 767px) 100vw, 1280px"
              className="object-contain p-3 md:p-6"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => {
            dialog.current?.showModal();
            setExpanded(true);
          }}
          className="icon-button gallery-control absolute right-4 top-4"
          aria-label="Expand project screenshot"
        >
          <Expand size={19} />
        </button>
        {validImages.length > 1 && (
          <>
            <button
              onClick={previous}
              className="icon-button gallery-control absolute bottom-5 left-4"
              aria-label="Previous screenshot"
            >
              <ArrowLeft size={19} />
            </button>
            <button
              onClick={next}
              className="icon-button gallery-control absolute bottom-5 right-4"
              aria-label="Next screenshot"
            >
              <ArrowRight size={19} />
            </button>
            {running && (
              <div
                key={`${selected.id}-${running}`}
                className="gallery-progress"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-5">
        <p
          className="muted text-sm"
          aria-live={running ? "off" : "polite"}
          aria-atomic="true"
        >
          {selected.caption || title}
        </p>
        <div className="flex shrink-0 items-center gap-4">
          {validImages.length > 1 && (
            <button
              data-playback
              onClick={() => {
                setPlayback(playing ? "pause" : "play");
                setFocused(false);
              }}
              className="gallery-playback"
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              <span>{playing ? "Pause" : "Play"}</span>
            </button>
          )}
          <span className="font-mono text-xs text-[#9ba6ba]">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(validImages.length).padStart(2, "0")}
          </span>
        </div>
      </div>
      {validImages.length > 1 && (
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {validImages.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setIndex(i)}
              aria-label={`Show screenshot ${i + 1}`}
              aria-pressed={i === activeIndex}
              className={`gallery-thumbnail relative h-20 w-28 shrink-0 overflow-hidden rounded-md border ${i === activeIndex ? "border-primary" : "border-border hover:border-primary/60"}`}
            >
              <Image
                src={image.imageUrl}
                alt=""
                fill
                sizes="126px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className="!max-w-[95vw] !w-[1280px] !p-3"
        onClose={() => setExpanded(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            previous();
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
          }
        }}
        aria-label="Project screenshot viewer"
      >
        <button
          className="icon-button gallery-control absolute right-4 top-4 z-10"
          onClick={() => dialog.current?.close()}
          aria-label="Close screenshot viewer"
        >
          <X size={20} />
        </button>
        <div className="relative h-[75vh]">
          <Image
            src={selected.imageUrl}
            alt={selected.caption || title}
            fill
            sizes="95vw"
            className="object-contain"
          />
        </div>
        {validImages.length > 1 && (
          <div className="flex items-center justify-center gap-6 py-3">
            <button
              className="icon-button"
              onClick={previous}
              aria-label="Previous full screenshot"
            >
              <ArrowLeft size={19} />
            </button>
            <span className="font-mono text-sm" aria-live="polite">
              {activeIndex + 1} / {validImages.length}
            </span>
            <button
              className="icon-button"
              onClick={next}
              aria-label="Next full screenshot"
            >
              <ArrowRight size={19} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
