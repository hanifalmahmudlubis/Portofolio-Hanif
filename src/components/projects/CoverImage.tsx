"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Wide screenshots fill the browser frame; square artwork such as an app logo
 * is shown whole on the frame background instead of being cropped.
 */
export default function CoverImage({
  src,
  alt,
  sizes,
  preload = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
}) {
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      data-fit={fit}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalWidth / image.naturalHeight < 1.3) setFit("contain");
      }}
      className="browser-cover"
    />
  );
}
