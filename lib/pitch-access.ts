import { createHmac, timingSafeEqual } from "node:crypto";

// Shared-password gate for the pitch pages. proxy.ts checks the cookie on every
// request under the pitch paths (pages, images, videos); the form handler in
// app/api/pitch-access sets the cookie once the password has been entered.

export const PITCH_ACCESS_COOKIE = "vm_pitch_access";
export const PITCH_ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // seconds: 30 days
export const PITCH_ACCESS_FORM = "/pitch-access";
export const PITCH_ACCESS_DEFAULT = "/pitch-vm2luya";

// Keep in step with the matcher in proxy.ts: a path that is listed here but not
// matched there would be served without the check.
const PITCH_ROOTS = ["/pitch", "/pitch-vm2luya"];

export function isPitchPath(pathname: string) {
  return PITCH_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

/** The password viewers must enter, or null when this deployment has none. */
export function pitchPassword(env: Record<string, string | undefined> = process.env) {
  const value = env.PITCH_ACCESS_PASSWORD?.trim();
  return value ? value : null;
}

function digest(password: string, value: string) {
  return createHmac("sha256", password).update(value).digest();
}

/** Cookie value proving the password was entered. It changes when the password changes. */
export function pitchAccessToken(password: string) {
  return digest(password, "pitch-access:v1").toString("hex");
}

export function isCorrectPitchPassword(submitted: string, password: string | null) {
  if (!password) return false;
  // Compare keyed digests, so the comparison takes the same time whatever was typed.
  return timingSafeEqual(
    digest(password, `submitted:${submitted.trim()}`),
    digest(password, `submitted:${password}`),
  );
}

export function hasPitchAccess(cookieValue: string | undefined, password: string | null) {
  if (!password || !cookieValue) return false;
  const expected = Buffer.from(pitchAccessToken(password));
  const given = Buffer.from(cookieValue);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Where to go after the password: only ever back into the pitch pages. */
export function pitchNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return PITCH_ACCESS_DEFAULT;
  }

  return isPitchPath(value.split(/[?#]/)[0]) ? value : PITCH_ACCESS_DEFAULT;
}
