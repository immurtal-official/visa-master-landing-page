import { NextResponse } from "next/server";

import {
  isCorrectPitchPassword,
  PITCH_ACCESS_COOKIE,
  PITCH_ACCESS_FORM,
  PITCH_ACCESS_MAX_AGE,
  pitchAccessToken,
  pitchNextPath,
  pitchPassword,
} from "@/lib/pitch-access";

const FAILED_ATTEMPT_DELAY_MS = 600;

function backToForm(request: Request, next: string, error: "invalid" | "unavailable") {
  const url = new URL(PITCH_ACCESS_FORM, request.url);
  url.searchParams.set("next", next);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const nextField = form?.get("next");
  const passwordField = form?.get("password");
  const next = pitchNextPath(typeof nextField === "string" ? nextField : null);
  const submitted = typeof passwordField === "string" ? passwordField : "";
  const password = pitchPassword();

  // Without a configured password nobody gets in: the pages stay closed rather than open.
  if (!password) {
    return backToForm(request, next, "unavailable");
  }

  if (submitted.length > 200 || !isCorrectPitchPassword(submitted, password)) {
    // There is no attempt counter here; a short wait at least slows guessing down.
    await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
    return backToForm(request, next, "invalid");
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set({
    name: PITCH_ACCESS_COOKIE,
    value: pitchAccessToken(password),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PITCH_ACCESS_MAX_AGE,
  });
  return response;
}
