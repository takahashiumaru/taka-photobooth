"use client";

import { useEffect } from "react";

/**
 * Devin Apps' S3 host serves `/index.html` for any subroute that doesn't have
 * a matching object — meaning a deep-link to `/layout/` may end up serving the
 * homepage shell. This component is mounted *only on the home page*: if the
 * actual URL is one of our known routes (not `/`), we hard-navigate to the
 * correct route's HTML so the right page is fetched and rendered.
 *
 * Using `window.location.replace(...)` (instead of `router.replace`) forces
 * a real GET so S3 hands us the right `/layout/index.html`, `/camera/index.html`,
 * etc. — `router.replace` would just patch the client router and re-render the
 * same already-loaded homepage bundle.
 */
const KNOWN_ROUTES = new Set([
  "/layout",
  "/size",
  "/camera",
  "/frame",
  "/result",
]);

export function RouteFallback() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    if (path !== "/" && KNOWN_ROUTES.has(path)) {
      // S3 serves /index.html for "/layout/" but the *exact*
      // "/layout/index.html" object resolves correctly. Redirect to the
      // index.html URL so we get the right HTML; once Next hydrates it
      // takes over and pretty-URLs will work for in-app navigation.
      const target = `${path}/index.html`;
      window.location.replace(target);
    }
  }, []);

  return null;
}
