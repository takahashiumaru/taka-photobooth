"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "tpb-hydrated";

/**
 * Prevent rendering of children that depend on persisted Zustand state until
 * the client store has hydrated. Avoids SSR/CSR mismatch.
 *
 * The flag is stored in module scope AND in sessionStorage so that any
 * hard-reload-driven navigation between routes (e.g. /camera → /frame)
 * doesn't flash a "Loading…" placeholder. Once hydrated within a tab,
 * subsequent page loads in the same tab render synchronously.
 */
let hydratedOnce =
  typeof window !== "undefined" &&
  window.sessionStorage?.getItem(SESSION_KEY) === "1";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<boolean>(hydratedOnce);

  useEffect(() => {
    if (!hydratedOnce) {
      hydratedOnce = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* sessionStorage may be unavailable; flag is also kept in memory */
      }
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-ink/40">
        <span className="animate-pulse">Loading…</span>
      </div>
    );
  }
  return <>{children}</>;
}
