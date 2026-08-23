const DISPLAY_NAME_KEYS = [
  "display_name",
  "full_name",
  "name",
  "preferred_username",
  "user_name",
  "username",
] as const;

export function displayNameFromMetadata(metadata: Record<string, unknown>) {
  for (const key of DISPLAY_NAME_KEYS) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}
