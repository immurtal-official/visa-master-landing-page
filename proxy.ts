import { NextResponse, type NextRequest } from "next/server";

import {
  hasPitchAccess,
  isPitchPath,
  PITCH_ACCESS_COOKIE,
  PITCH_ACCESS_FORM,
  pitchPassword,
} from "@/lib/pitch-access";
import { updateSession } from "@/lib/supabase/proxy";

// The pitch pages are static files in public/. Proxy runs before those files are
// served, so this is the one place that can ask for the password.
function pitchGate(request: NextRequest) {
  const cookie = request.cookies.get(PITCH_ACCESS_COOKIE)?.value;

  if (hasPitchAccess(cookie, pitchPassword())) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const wantsPage =
    (request.method === "GET" || request.method === "HEAD") &&
    (request.headers.get("accept") ?? "").includes("text/html");

  // Images, videos and scripts get a plain refusal; only a page view is sent to the form.
  if (!wantsPage) {
    return new NextResponse("Password required.\n", {
      status: 401,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const form = request.nextUrl.clone();
  form.pathname = PITCH_ACCESS_FORM;
  form.search = "";
  form.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);

  const response = NextResponse.redirect(form);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  if (isPitchPath(request.nextUrl.pathname)) {
    return pitchGate(request);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/workspace/:path*",
    "/onboarding/:path*",
    "/account/update-password/:path*",
    // Every pitch page and every file it loads. Keep in step with lib/pitch-access.ts.
    "/pitch",
    "/pitch/:path*",
    "/pitch-vm2luya",
    "/pitch-vm2luya/:path*",
  ],
};
