"use client";

import { useEffect, useState } from "react";
import { LAYOUTS } from "@/lib/layouts";
import { FRAMES } from "@/lib/frames";
import { FrameStrip } from "./FrameStrip";

const PREVIEW_PHOTOS = [
  // Subtle abstract gradient placeholders (so we don't need bundled images)
  toDataGradient("#FFB6C1", "#FFD6A5"),
  toDataGradient("#A0E7E5", "#B5DEFF"),
  toDataGradient("#FBE7C6", "#FFAEBC"),
  toDataGradient("#B49BFF", "#FF8AB4"),
];

const SHOWCASE = [
  { layoutId: "stripB-4", frameId: "ivory" },
  { layoutId: "stripB-4", frameId: "noir" },
  { layoutId: "hearts-4", frameId: "burgundy" },
  { layoutId: "stripB-4", frameId: "rose-gold" },
  { layoutId: "stripB-4", frameId: "neon" },
];

export function LandingPreview() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SHOWCASE.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto flex h-[440px] w-full max-w-[420px] items-center justify-center md:h-[520px]">
      {/* Glow */}
      <div className="absolute -inset-6 -z-10 rounded-[60px] bg-gradient-to-br from-rose-200/60 via-white/40 to-plum-200/60 blur-2xl" />

      {SHOWCASE.map((s, i) => {
        const layout = LAYOUTS.find((l) => l.id === s.layoutId)!;
        const frame = FRAMES.find((f) => f.id === s.frameId)!;
        const offset = i - idx;
        const visible = offset === 0;
        return (
          <div
            key={i}
            className="absolute transition-all duration-700 ease-out"
            style={{
              transform: `translateX(${offset * 60}px) translateY(${
                Math.abs(offset) * 30
              }px) rotate(${offset * 4}deg) scale(${visible ? 1 : 0.92})`,
              opacity: Math.max(0, 1 - Math.abs(offset) * 0.5),
              zIndex: 10 - Math.abs(offset),
            }}
          >
            <FrameStrip
              layout={layout}
              frame={frame}
              photos={PREVIEW_PHOTOS}
              height={440}
            />
          </div>
        );
      })}
    </div>
  );
}

function toDataGradient(a: string, b: string) {
  // Simple SVG gradient encoded as data URL
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
    </linearGradient></defs>
    <rect width='200' height='200' fill='url(#g)'/>
    <circle cx='150' cy='60' r='30' fill='white' opacity='0.25'/>
    <circle cx='60' cy='150' r='40' fill='white' opacity='0.18'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
