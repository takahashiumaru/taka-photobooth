/**
 * Background "scenes" used for the bg-removal feature.
 *
 * Each scene returns either:
 *  - A simple CSS-style value (solid color, linear gradient) — drawn natively
 *  - A function that takes a CanvasRenderingContext2D + dims and paints
 *
 * For SVG-based scenes (curtains, etc.), we use a data URL which is loaded
 * once and cached.
 */

export type SceneId =
  | "transparent"
  | "studio-cream"
  | "studio-white"
  | "studio-black"
  | "studio-dusty-pink"
  | "studio-sage"
  | "studio-tan"
  | "curtain-rouge"
  | "curtain-beige"
  | "curtain-blush"
  | "gradient-sakura"
  | "gradient-sunset"
  | "gradient-mint"
  | "custom";

export type SceneCategory = "Studio" | "Curtain" | "Gradient" | "Special";

export type Scene = {
  id: SceneId;
  name: string;
  category: SceneCategory;
  // CSS background (solid / gradient / svg-data-url). null = transparent.
  bg: string | null;
  // Small swatch CSS value for picker thumbnail.
  swatch: string;
};

// SVG curtain backdrops — embedded as data URLs.
const curtainSvg = (
  base: string,
  fold: string,
  highlight: string
) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <linearGradient id='base' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='${base}'/>
      <stop offset='1' stop-color='${fold}'/>
    </linearGradient>
    <linearGradient id='lift' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='${highlight}' stop-opacity='0.35'/>
      <stop offset='0.5' stop-color='${highlight}' stop-opacity='0'/>
    </linearGradient>
    <pattern id='folds' x='0' y='0' width='80' height='1000' patternUnits='userSpaceOnUse'>
      <rect width='80' height='1000' fill='url(#base)'/>
      <path d='M0 0 Q 20 250 0 500 Q -20 750 0 1000 Z' fill='${fold}' opacity='0.45'/>
      <path d='M40 0 Q 30 250 40 500 Q 50 750 40 1000 Z' fill='${highlight}' opacity='0.25'/>
      <path d='M80 0 Q 60 250 80 500 Q 100 750 80 1000 Z' fill='${fold}' opacity='0.45'/>
    </pattern>
  </defs>
  <rect width='800' height='1000' fill='url(#folds)'/>
  <rect width='800' height='400' fill='url(#lift)'/>
  <rect y='950' width='800' height='50' fill='${fold}' opacity='0.6'/>
</svg>`)}`;

export const SCENES: Scene[] = [
  {
    id: "transparent",
    name: "Transparent",
    category: "Special",
    bg: null,
    swatch:
      "repeating-conic-gradient(rgba(0,0,0,0.12) 0% 25%, rgba(0,0,0,0.04) 0% 50%) 0 0/12px 12px,#fff",
  },

  // Studio backdrops — clean, even-lit
  {
    id: "studio-cream",
    name: "Cream Studio",
    category: "Studio",
    bg: "linear-gradient(180deg,#FBF5EC 0%, #EFE3D2 100%)",
    swatch: "linear-gradient(180deg,#FBF5EC,#EFE3D2)",
  },
  {
    id: "studio-white",
    name: "White Studio",
    category: "Studio",
    bg: "linear-gradient(180deg,#FFFFFF 0%, #E8E8E8 100%)",
    swatch: "linear-gradient(180deg,#FFFFFF,#E8E8E8)",
  },
  {
    id: "studio-black",
    name: "Black Studio",
    category: "Studio",
    bg: "linear-gradient(180deg,#1A1A1A 0%, #0A0A0A 100%)",
    swatch: "linear-gradient(180deg,#1A1A1A,#0A0A0A)",
  },
  {
    id: "studio-dusty-pink",
    name: "Dusty Pink",
    category: "Studio",
    bg: "linear-gradient(180deg,#F4D6D2 0%, #DCB4AF 100%)",
    swatch: "linear-gradient(180deg,#F4D6D2,#DCB4AF)",
  },
  {
    id: "studio-sage",
    name: "Sage",
    category: "Studio",
    bg: "linear-gradient(180deg,#C7D5C1 0%, #95A48F 100%)",
    swatch: "linear-gradient(180deg,#C7D5C1,#95A48F)",
  },
  {
    id: "studio-tan",
    name: "Tan",
    category: "Studio",
    bg: "linear-gradient(180deg,#D9BFA0 0%, #B89678 100%)",
    swatch: "linear-gradient(180deg,#D9BFA0,#B89678)",
  },

  // Curtains — SVG-based folds
  {
    id: "curtain-rouge",
    name: "Rouge Velvet",
    category: "Curtain",
    bg: `url("${curtainSvg("#7E1822", "#4A0810", "#C26674")}") center/cover`,
    swatch: `url("${curtainSvg("#7E1822", "#4A0810", "#C26674")}") center/cover`,
  },
  {
    id: "curtain-beige",
    name: "Beige Drape",
    category: "Curtain",
    bg: `url("${curtainSvg("#D6C2A0", "#A28C68", "#F0E4CF")}") center/cover`,
    swatch: `url("${curtainSvg("#D6C2A0", "#A28C68", "#F0E4CF")}") center/cover`,
  },
  {
    id: "curtain-blush",
    name: "Blush Swag",
    category: "Curtain",
    bg: `url("${curtainSvg("#E8B6B6", "#B07277", "#FAD9D9")}") center/cover`,
    swatch: `url("${curtainSvg("#E8B6B6", "#B07277", "#FAD9D9")}") center/cover`,
  },

  // Gradients
  {
    id: "gradient-sakura",
    name: "Sakura",
    category: "Gradient",
    bg: "linear-gradient(135deg,#FFE0EC,#B49BFF)",
    swatch: "linear-gradient(135deg,#FFE0EC,#B49BFF)",
  },
  {
    id: "gradient-sunset",
    name: "Sunset",
    category: "Gradient",
    bg: "linear-gradient(135deg,#FBE7C6,#FFAEBC)",
    swatch: "linear-gradient(135deg,#FBE7C6,#FFAEBC)",
  },
  {
    id: "gradient-mint",
    name: "Mint",
    category: "Gradient",
    bg: "linear-gradient(135deg,#A0E7E5,#B5DEFF)",
    swatch: "linear-gradient(135deg,#A0E7E5,#B5DEFF)",
  },

  // Custom upload (image stored in store.customScene)
  {
    id: "custom",
    name: "Custom",
    category: "Special",
    bg: "transparent",
    swatch:
      "conic-gradient(from 180deg at 50% 50%, #FFC2D2 0deg, #B49BFF 90deg, #A0E7E5 180deg, #FFD6A5 270deg, #FFC2D2 360deg)",
  },
];

export function getScene(id: SceneId): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
