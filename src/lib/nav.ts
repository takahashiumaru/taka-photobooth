/**
 * Pragmatic navigation helper.
 *
 * The Devin Apps S3 host serves `/index.html` for any subroute even when the
 * exact route folder exists (e.g. `/frame/` returns the homepage). Going via
 * Next's client router or a plain `Link` href causes a brief flash of the
 * homepage before our `RouteFallback` redirects to `/frame/index.html`.
 *
 * Calling this helper instead navigates directly to `/<path>/index.html`,
 * which the host serves correctly on first try — no flash, no detour.
 */
export type AppRoute =
  | "/"
  | "/layout"
  | "/size"
  | "/camera"
  | "/frame"
  | "/result";

export function navigate(path: AppRoute): void {
  if (typeof window === "undefined") return;
  if (path === "/") {
    window.location.assign("/");
    return;
  }
  window.location.assign(`${path}/index.html`);
}
