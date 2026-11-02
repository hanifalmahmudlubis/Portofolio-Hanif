const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
/** A calendar month has no timezone. Preserve legacy "Sep 2024" values without Date parsing. */
export function normalizeMonth(value: string): string | null {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const month = Number(iso[2]);
    return Number(iso[1]) >= 1900 &&
      Number(iso[1]) <= 2100 &&
      month >= 1 &&
      month <= 12
      ? trimmed
      : null;
  }
  const legacy = /^([a-z]+)\s+(\d{4})$/i.exec(trimmed);
  if (!legacy) return null;
  const index = months.findIndex(
    (month) =>
      month === legacy[1].toLowerCase() ||
      month.slice(0, 3) === legacy[1].toLowerCase(),
  );
  if (index < 0) return null;
  return normalizeMonth(`${legacy[2]}-${String(index + 1).padStart(2, "0")}`);
}
