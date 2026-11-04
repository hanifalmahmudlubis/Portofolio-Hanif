import { normalizeMonth } from "./dates";
import type { PublicProfile } from "../types/cv";
export const DEFAULT_INTRO_IMAGE = "/profile.jpg";
export const site = {
  name: "Hanif Al Mahmud Lubis",
  email: "hanifmahmud2905@gmail.com",
  github: "https://github.com/hanifalmahmudlubis?tab=repositories",
  linkedin: "https://www.linkedin.com/in/hanifalmahmudlubis/",
};
export const initialPublicProfile: PublicProfile = {
  fullName: site.name,
  professionalTitle: "Software Engineering Graduate",
  shortBio:
    "Building practical solutions through web, mobile, and machine learning",
  location: "Medan, Indonesia",
  email: site.email,
  githubUrl: site.github,
  linkedinUrl: site.linkedin,
  educationLine: "A graduate of Politeknik Negeri Medan",
};
export function formatMonth(value: string) {
  const month = normalizeMonth(value);
  return month
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${month}-01T00:00:00Z`))
    : value;
}
export function toMonthInput(value: string | null) {
  return value ? normalizeMonth(value) || "" : "";
}
