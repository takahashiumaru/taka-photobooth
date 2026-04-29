import type { CustomBg } from "./store";

/**
 * Convert a CustomBg config to a CSS background value (used by DOM preview).
 * Returns null when the user wants the strip to be transparent — the caller
 * should render a checker pattern in the preview to indicate transparency.
 */
export function customBgToCss(cb: CustomBg): string | null {
  switch (cb.mode) {
    case "transparent":
      return null;
    case "solid":
      return cb.color1;
    case "gradient":
      return `linear-gradient(${cb.angle}deg, ${cb.color1}, ${cb.color2})`;
    case "image":
      if (cb.image) {
        const fit = cb.imageFit === "contain" ? "contain" : "cover";
        return `url("${cb.image}") center/${fit} no-repeat, ${cb.color1}`;
      }
      return cb.color1;
  }
}

export function isCustomFrame(id: string) {
  return id === "custom";
}
