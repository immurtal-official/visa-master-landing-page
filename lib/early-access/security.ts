import "server-only";

import { createHmac } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInviteSecuritySecret() {
  const secret = process.env.INVITE_SECURITY_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "Invite security is not configured. Add an INVITE_SECURITY_SECRET of at least 32 characters.",
    );
  }

  return secret;
}

function digest(namespace: "ip" | "phrase", value: string) {
  return createHmac("sha256", getInviteSecuritySecret())
    .update(`${namespace}:${value}`)
    .digest("hex");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function normalizeInvitePhrase(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function digestInvitePhrase(value: string) {
  return digest("phrase", normalizeInvitePhrase(value));
}

export function digestIpAddress(value: string) {
  return digest("ip", value.trim() || "unknown");
}

export function requestIp(request: Request) {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return vercelForwarded || forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
