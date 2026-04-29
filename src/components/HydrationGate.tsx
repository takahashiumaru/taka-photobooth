"use client";

import { useEffect, useState } from "react";

/**
 * Prevent rendering of children that depend on persisted Zustand state until
 * the client store has hydrated. Avoids SSR/CSR mismatch.
 */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-ink/40">
        <span className="animate-pulse">Loading…</span>
      </div>
    );
  }
  return <>{children}</>;
}
