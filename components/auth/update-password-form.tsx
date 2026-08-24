"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    router.push("/workspace");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        <span>New password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus />
      </label>
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      <button className="email-button" type="submit" disabled={pending}>{pending ? "…" : "Save new password"}</button>
    </form>
  );
}
