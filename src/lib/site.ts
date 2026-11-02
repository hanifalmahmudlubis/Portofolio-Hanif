import { normalizeMonth } from "./dates";
export const site = {
  name: "Hanif Al Mahmud Lubis",
  email: "hanifmahmud2905@gmail.com",
  github: "https://github.com/hanifalmahmudlubis?tab=repositories",
  linkedin: "https://www.linkedin.com/in/hanifalmahmudlubis/",
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
