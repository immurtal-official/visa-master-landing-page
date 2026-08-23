import { NextResponse, type NextRequest } from "next/server";

import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user && !next.startsWith("/account/")) {
        if (!displayNameFromMetadata(userData.user.user_metadata)) {
          const onboardingUrl = new URL("/onboarding/profile", request.url);
          onboardingUrl.searchParams.set("next", next);
          return NextResponse.redirect(onboardingUrl);
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set("next", next);
  return NextResponse.redirect(errorUrl);
}
