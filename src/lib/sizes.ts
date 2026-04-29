import type { SizeDef } from "./types";

export const SIZES: SizeDef[] = [
  { id: "2x6", label: "2 × 6 strip", inchW: 2, inchH: 6, description: "Classic photobooth strip" },
  { id: "4x6", label: "4 × 6", inchW: 4, inchH: 6, description: "Common print, fits most albums" },
  { id: "6x4", label: "6 × 4 wide", inchW: 6, inchH: 4, description: "Landscape grid" },
  { id: "6x6", label: "6 × 6 square", inchW: 6, inchH: 6, description: "Instagram-ready square" },
  { id: "5x7", label: "5 × 7", inchW: 5, inchH: 7, description: "Larger keepsake print" },
  { id: "3x4", label: "3 × 4", inchW: 3, inchH: 4, description: "Standard photo size" },
];

export const getSize = (id: string | null) =>
  SIZES.find((s) => s.id === id) ?? null;
