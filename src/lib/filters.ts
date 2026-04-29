export const FILTERS: { id: string; name: string; css: string }[] = [
  { id: "none", name: "Original", css: "none" },
  { id: "soft", name: "Soft Glow", css: "brightness(1.05) saturate(1.05) contrast(1.02) blur(0.2px)" },
  { id: "warm", name: "Warm", css: "sepia(0.18) saturate(1.18) hue-rotate(-8deg) brightness(1.04)" },
  { id: "cool", name: "Cool", css: "saturate(1.1) hue-rotate(6deg) brightness(1.03)" },
  { id: "bw", name: "B&W", css: "grayscale(1) contrast(1.05) brightness(1.03)" },
  { id: "vintage", name: "Vintage", css: "sepia(0.5) contrast(0.95) saturate(0.85) brightness(1.02)" },
  { id: "vivid", name: "Vivid", css: "saturate(1.4) contrast(1.08)" },
];
