import { NextResponse } from "next/server";

import { isValidEmail, normalizeEmail } from "@/lib/early-access/security";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("early_access_members").insert({ email });

    // A duplicate means the address is already waitlisted, authorized, or joined.
    // Keep the response identical so this endpoint cannot enumerate membership.
    if (error && error.code !== "23505") throw error;

    return NextResponse.json({ status: "joined" });
  } catch (error) {
    console.error("Unable to join the early-access waitlist", error);
    return NextResponse.json(
      { error: "We couldn’t save your email. Please try again." },
      { status: 500 },
    );
  }
}
