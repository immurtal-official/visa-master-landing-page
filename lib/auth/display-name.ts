const DISPLAY_NAME_KEYS = [
  "display_name",
  "full_name",
  "name",
  "preferred_username",
  "user_name",
  "username",
] as const;

export const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,23}$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value);
}

export function displayNameFromMetadata(metadata: Record<string, unknown>) {
  for (const key of DISPLAY_NAME_KEYS) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}
