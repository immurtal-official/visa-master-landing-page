"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,23}$/;

export function UsernameForm({ initialUsername, next }: { initialUsername: string; next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError("Use 3–24 characters, starting with a letter. Only letters, numbers, and underscores are allowed.");
      return;
    }

    setPending(true);
    setError("");

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      router.push(`/login?next=${encodeURIComponent("/onboarding/profile")}`);
      router.refresh();
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { display_name: normalizedUsername, username: normalizedUsername },
    });

    if (updateError) {
      setError("We couldn’t save your username. Please try again.");
      setPending(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  const hasError = Boolean(error);

  return (
    <form className="profile-form" onSubmit={submit} aria-busy={pending}>
      <label htmlFor="username">Username</label>
      <div className="username-field">
        <span aria-hidden="true">@</span>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
            if (error) setError("");
          }}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          minLength={3}
          maxLength={24}
          pattern="[a-z][a-z0-9_]{2,23}"
          aria-describedby={hasError ? "username-help username-error" : "username-help"}
          aria-invalid={hasError}
          required
          autoFocus
        />
      </div>
      <p id="username-help" className="field-help">
        Start with a letter. Use 3–24 lowercase letters, numbers, or underscores.
      </p>
      {error && <p id="username-error" className="auth-feedback error" role="alert">{error}</p>}
      <button className="utility-primary profile-submit" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue to my workspace"}
      </button>
    </form>
  );
}
