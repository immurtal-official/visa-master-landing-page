export function safeNextPath(value: string | null, fallback = "/workspace") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  return value;
}
