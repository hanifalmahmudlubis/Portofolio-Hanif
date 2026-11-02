export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}
export function imageUrl(value: string | null | undefined): string | undefined {
  if (
    value?.startsWith("/uploads/") &&
    !value.includes("..") &&
    !value.includes("\\")
  )
    return value;
  return safeUrl(value);
}
