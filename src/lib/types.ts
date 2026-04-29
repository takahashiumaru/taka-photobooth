export type LayoutKind = "strip" | "grid";

export type LayoutDef = {
  id: string;
  name: string;
  description: string;
  poses: number;
  // grid description: rows x cols of cells
  rows: number;
  cols: number;
  // Output aspect: width / height in inches
  inchW: number;
  inchH: number;
  badge?: "NEW" | "POPULAR" | "TRY IT";
  accent: string; // tailwind gradient classes for card accent
  kind: LayoutKind;
  // Per-cell aspect override; defaults to 4:3 landscape if omitted
  cellAspect?: number; // width / height
  // Title style for the strip footer
  stripTitle?: string;
};

export type SizeDef = {
  id: string;
  label: string;
  inchW: number;
  inchH: number;
  description: string;
};

export type FrameDef = {
  id: string;
  name: string;
  category: "Classic" | "Decorative" | "Themed";
  // background of the strip/grid surface (CSS value or "transparent")
  background: string;
  // border around each photo cell
  cellBorder?: string;
  cellRadius?: number; // px in preview units
  // Outer border around full strip
  outerBorder?: string;
  outerRadius?: number; // px in preview units
  // Optional decorative overlay (CSS background)
  overlay?: string;
  // Footer color for strip title
  titleColor?: string;
  // text color for the strip title tag
  tagColor?: string;
  // swatch preview gradient for selector chip
  swatch: string;
};

export type CapturedPhoto = {
  dataUrl: string;
  takenAt: number;
};
