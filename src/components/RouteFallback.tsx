"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * When the static-export host serves "/index.html" for any subroute
 * (i.e. all paths return the home shell), this component detects the URL
 * mismatch on mount and redirects to the correct Next.js route.
 */
export function RouteFallback() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const actual = window.location.pathname.replace(/\/+$/, "") || "/";
    const known = ["/layout", "/size", "/camera", "/frame", "/result"];
    if (known.includes(actual) && pathname !== actual) {
      router.replace(actual);
    }
  }, [pathname, router]);

  return null;
}
