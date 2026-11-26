import { imageUrl } from "./urls";

/** The thumbnail image, or the first gallery image when none is marked. */
export function projectCover(project: {
  images: { imageUrl: string; isThumbnail: boolean }[];
}) {
  return imageUrl(
    project.images.find((image) => image.isThumbnail)?.imageUrl ??
      project.images[0]?.imageUrl,
  );
}

export function initials(title: string) {
  return title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
