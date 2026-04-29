"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import type { FrameDef, LayoutDef } from "@/lib/types";
import type { CustomBg } from "@/lib/store";
import { customBgToCss, isCustomFrame } from "@/lib/customBg";

type Props = {
  layout: LayoutDef;
  frame: FrameDef;
  photos: (string | null)[]; // dataUrls; null = empty placeholder
  // Total target *visual* height in px for preview, width derives from inch ratio.
  height: number;
  // Whether to render decorative overlays (hearts/glitter etc.). Off when generating final canvas via DOM-rip.
  showDecor?: boolean;
  className?: string;
  // Render as a sample (when used in layout-chooser cards)
  sample?: boolean;
  // Show counter overlay on empty cell
  highlightIndex?: number;
  // Custom background config (used only when frame.id === "custom")
  customBg?: CustomBg;
};

export function FrameStrip({
  layout,
  frame,
  photos,
  height,
  showDecor = true,
  className,
  sample = false,
  highlightIndex,
  customBg,
}: Props) {
  const isCustom = isCustomFrame(frame.id) && !!customBg;
  const customCss = isCustom && customBg ? customBgToCss(customBg) : undefined;
  const isTransparent = isCustom && customCss === null;
  const aspect = layout.inchW / layout.inchH;
  const width = height * aspect;

  // padding scales with height
  const pad = Math.max(8, Math.round(height * 0.035));
  const gap = Math.max(4, Math.round(height * 0.018));
  const cellRadius =
    frame.cellRadius !== undefined
      ? Math.max(2, Math.round((frame.cellRadius * height) / 600))
      : 6;
  const outerRadius =
    frame.outerRadius !== undefined
      ? Math.max(6, Math.round((frame.outerRadius * height) / 600))
      : 16;

  const titleText = layout.stripTitle ?? "Takaphotobooth";
  const tagText = `${new Date().getFullYear()} · ${layout.inchW}×${layout.inchH}`;
  const availableW = Math.max(40, width - 2 * pad);
  // Italic Fraunces avg ≈ 0.45em, uppercase Plus Jakarta tracking 0.16em ≈ 0.62em.
  // Estimate widths at base sizes; if both fit one line, render side-by-side; else stack.
  const baseTitleSize = Math.max(10, Math.round(height * 0.034));
  const baseTagSize = Math.max(8, Math.round(height * 0.018));
  const oneLineNeeded =
    titleText.length * baseTitleSize * 0.5 +
    tagText.length * baseTagSize * 0.62 +
    6;
  const stackVertical = oneLineNeeded > availableW;

  // For stacked layout, give title slightly bigger size from a taller titleH.
  const titleSize = Math.max(
    8,
    Math.min(
      baseTitleSize,
      Math.floor(availableW / (titleText.length * 0.5))
    )
  );
  const tagSize = Math.max(
    7,
    Math.min(
      baseTagSize,
      Math.floor(availableW / (tagText.length * 0.62))
    )
  );

  // Resolve background. For custom transparent we render a checker pattern so
  // the user can see *something* in the preview.
  const resolvedBg = isCustom
    ? customCss ?? checkerPattern()
    : frame.background;

  const containerStyle: CSSProperties = {
    width,
    height,
    background: resolvedBg,
    borderRadius: outerRadius,
    border: isTransparent
      ? "1px dashed rgba(0,0,0,0.18)"
      : frame.outerBorder ?? "none",
    padding: pad,
    boxShadow: isTransparent
      ? "0 12px 30px -16px rgba(20, 14, 35, 0.18)"
      : "0 24px 60px -28px rgba(20, 14, 35, 0.45), 0 1px 0 rgba(255,255,255,0.6) inset",
    position: "relative",
    overflow: "hidden",
  };

  const isPolaroid = frame.id === "polaroid";

  // Polaroid only uses one big bottom margin, single image — but we still support multi.
  // Cell area
  const titleH = Math.round(height * (stackVertical ? 0.11 : 0.08));

  return (
    <div className={clsx("relative", className)} style={containerStyle}>
      {/* Decorative overlay (theme effects) */}
      {showDecor && frame.overlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: frame.overlay,
            mixBlendMode: frame.id === "holo" ? "overlay" : "normal",
            borderRadius: outerRadius,
          }}
        />
      )}

      {/* Photo grid */}
      <div
        className="relative grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr) ${titleH}px`,
          gap,
          gridAutoFlow: "row",
        }}
      >
        {Array.from({ length: layout.poses }).map((_, i) => {
          const url = photos[i] ?? null;
          const isHighlight = highlightIndex === i && !url;
          return (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{
                background: url ? "#000" : "rgba(0,0,0,0.06)",
                border: frame.cellBorder,
                borderRadius: cellRadius,
                gridColumn: `span 1 / span 1`,
              }}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`Pose ${i + 1}`}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className={clsx(
                    "flex h-full w-full items-center justify-center",
                    sample && "dotted-cell",
                    isHighlight && "ring-2 ring-rose-500/70"
                  )}
                  style={{ color: "rgba(0,0,0,0.35)" }}
                >
                  {!sample && (
                    <span style={{ fontSize: Math.max(10, height * 0.04) }}>
                      {i + 1}
                    </span>
                  )}
                </div>
              )}

              {/* Hearts decoration on hearts layout */}
              {showDecor && layout.id === "hearts-4" && (
                <Heart
                  size={Math.max(10, height * 0.045)}
                  color="#FF3D74"
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    transform:
                      i % 2 === 0 ? "rotate(-12deg)" : "rotate(15deg)",
                    opacity: 0.95,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Title row — stacks vertically on narrow strips */}
        <div
          className={clsx(
            "col-span-full flex",
            stackVertical
              ? "flex-col items-center justify-end gap-0.5 text-center"
              : "items-end justify-between"
          )}
          style={{ gridColumn: `1 / -1` }}
        >
          <span
            className="font-display"
            style={{
              fontSize: titleSize,
              color: frame.titleColor ?? "#1A1326",
              letterSpacing: "0.01em",
              fontWeight: 300,
              fontStyle: "italic",
              whiteSpace: "nowrap",
              lineHeight: 1.05,
            }}
          >
            {titleText}
          </span>
          <span
            style={{
              fontSize: tagSize,
              color: frame.tagColor ?? frame.titleColor ?? "#1A1326",
              opacity: 0.7,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              lineHeight: 1.05,
            }}
          >
            {tagText}
          </span>
        </div>
      </div>

      {/* Vintage decorative grain overlay */}
      {showDecor && layout.id === "vintage-4" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: outerRadius,
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(255,200,140,0.18), transparent 60%), radial-gradient(120% 80% at 50% 100%, rgba(110,60,20,0.18), transparent 60%)",
          }}
        />
      )}

      {/* Solace fine-line frame */}
      {showDecor && layout.id === "solace-4" && !isPolaroid && (
        <div
          className="pointer-events-none absolute"
          style={{
            inset: pad / 2,
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: outerRadius - 4,
          }}
        />
      )}
    </div>
  );
}

function checkerPattern() {
  // 12px checker, light + lighter cells — signals transparency
  return (
    "repeating-conic-gradient(rgba(0,0,0,0.06) 0% 25%, rgba(0,0,0,0.02) 0% 50%) 0 0 / 18px 18px, #ffffff"
  );
}

function Heart({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      aria-hidden
    >
      <path
        fill={color}
        d="M12 21s-7.5-4.7-9.5-9.2C1 8.4 3.4 5 6.7 5c2 0 3.5 1.1 4.3 2.6h2c.8-1.5 2.3-2.6 4.3-2.6 3.3 0 5.7 3.4 4.2 6.8C19.5 16.3 12 21 12 21z"
      />
    </svg>
  );
}
