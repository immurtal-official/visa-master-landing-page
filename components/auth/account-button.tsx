"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/client";

type Viewer = {
  displayName: string | null;
};

export function AccountButton({
  getStarted,
  finishSetup,
  onGetStarted,
}: {
  getStarted: string;
  finishSetup: string;
  onGetStarted: () => void;
}) {
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    let active = true;
    let deferredLoad: number | undefined;

    async function loadViewer() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          if (active) setViewer(null);
          return;
        }

        const displayName = displayNameFromMetadata(data.user.user_metadata);
        if (active) setViewer({ displayName });
      } catch {
        if (active) setViewer(null);
      }
    }

    void loadViewer();

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange(() => {
        window.clearTimeout(deferredLoad);
        deferredLoad = window.setTimeout(() => void loadViewer(), 0);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // Authentication is optional in local environments that have no keys.
    }

    return () => {
      active = false;
      window.clearTimeout(deferredLoad);
      unsubscribe?.();
    };
  }, []);

  if (!viewer) {
    return <button className="quiet-button" type="button" onClick={onGetStarted}>{getStarted}</button>;
  }

  return (
    <button
      className="quiet-button account-button"
      type="button"
      onClick={() => router.push(viewer.displayName ? "/workspace" : "/onboarding/profile?next=/workspace")}
    >
      {viewer.displayName ?? finishSetup}
    </button>
  );
}
