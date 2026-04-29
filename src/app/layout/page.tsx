"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { LAYOUTS } from "@/lib/layouts";
import { FRAMES, getFrame } from "@/lib/frames";
import { FrameStrip } from "@/components/FrameStrip";
import { usePhotoBooth } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";
import type { LayoutDef, FrameDef } from "@/lib/types";

export default function LayoutPage() {
  return (
    <HydrationGate>
      <Inner />
    </HydrationGate>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const setLayout = usePhotoBooth((s) => s.setLayout);
  const layoutId = usePhotoBooth((s) => s.layoutId);
  const [selected, setSelected] = useState<string | null>(layoutId);

  // Allow ?pick=id to preselect
  useEffect(() => {
    const pick = params.get("pick");
    if (pick && LAYOUTS.some((l) => l.id === pick)) {
      setSelected(pick);
    }
  }, [params]);

  const previewFrame = getFrame("ivory");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-5 pb-24 pt-2">
        <div className="py-3 sm:py-6">
          <Stepper current={1} />
        </div>

        <div className="mb-5 sm:mb-10 text-center px-3">
          <span className="eyebrow text-[10px] sm:text-xs">Step 1 of 5</span>
          <h1 className="display-h2 mt-3 sm:mt-4 text-[28px] sm:text-5xl leading-[1.1]">
            Choose your layout
          </h1>
          <p className="mx-auto mt-2 sm:mt-3 max-w-[20rem] sm:max-w-md text-[13px] sm:text-sm leading-relaxed text-ink/60">
            Pick the strip or grid that fits the moment.
            <span className="hidden sm:inline"> You can pair it with any frame later.</span>
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          {LAYOUTS.map((l) => {
            const active = selected === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setSelected(l.id)}
                className={clsx(
                  "group relative flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl bg-white/70 p-3 sm:p-5 text-left backdrop-blur-xl shadow-card transition-all hover:-translate-y-1",
                  active &&
                    "ring-2 ring-rose-500 shadow-glow -translate-y-1"
                )}
              >
                {/* Badge */}
                {l.badge && (
                  <span
                    className={clsx(
                      "chip absolute right-2 top-2 sm:right-4 sm:top-4 text-[9px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1",
                      l.badge === "NEW" && "bg-rose-500 text-white",
                      l.badge === "POPULAR" && "bg-amber-300 text-amber-900",
                      l.badge === "TRY IT" && "bg-plum-600 text-white"
                    )}
                  >
                    {l.badge}
                  </span>
                )}

                <div
                  className={clsx(
                    "relative grid h-[220px] sm:h-[280px] w-full place-items-center overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br p-2 sm:p-4",
                    l.accent
                  )}
                >
                  <ResponsivePreview
                    layout={l}
                    frame={previewFrame}
                    maxHeight={l.kind === "strip" ? 210 : 200}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg sm:text-2xl italic font-light truncate">
                      {l.name}
                    </p>
                    <p className="hidden sm:block text-sm text-ink/60">{l.description}</p>
                    <p className="mt-0.5 sm:mt-1 truncate text-[10px] sm:text-xs text-ink/50">
                      {l.poses} pose · {l.inchW}×{l.inchH}{" "}
                      {l.kind === "strip" ? "Strip" : "Grid"}
                    </p>
                  </div>
                  <div
                    className={clsx(
                      "h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-full border-2 transition-all",
                      active
                        ? "border-rose-500 bg-rose-500"
                        : "border-black/15 bg-white"
                    )}
                  >
                    {active && (
                      <svg viewBox="0 0 24 24" className="h-full w-full text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 12l4 4 8-8" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sticky footer CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
            <p className="text-sm text-ink/60">
              {selected ? (
                <>
                  Selected:{" "}
                  <span className="font-medium text-ink">
                    {LAYOUTS.find((l) => l.id === selected)?.name}
                  </span>
                </>
              ) : (
                "Pick a layout to continue"
              )}
            </p>
            <button
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                setLayout(selected);
                router.push("/size");
              }}
              className="btn-primary"
            >
              Continue
              <Arrow />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

interface ResponsivePreviewProps {
  layout: LayoutDef;
  frame: FrameDef;
  /** Maximum height the panel can offer (px). The actual height is clamped
   * so that `width = height * (inchW / inchH)` never exceeds the available
   * container width — this is what keeps Layout G (6×6 square) and the
   * 4×6 grid from overflowing the card on small phones. */
  maxHeight: number;
}

/**
 * Renders a sample FrameStrip whose pixel size auto-fits the parent column.
 * Uses a ResizeObserver so the preview always fits — no more clipping when
 * the card is narrower than the strip's natural aspect ratio.
 */
function ResponsivePreview({
  layout,
  frame,
  maxHeight,
}: ResponsivePreviewProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (w > 0) setContainerWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const aspect = layout.inchW / layout.inchH;
  // Width derived from height; clamp height so width fits the container.
  const heightFromWidth = containerWidth > 0 ? containerWidth / aspect : maxHeight;
  const finalHeight = Math.max(80, Math.floor(Math.min(maxHeight, heightFromWidth)));

  return (
    <div ref={wrapRef} className="grid w-full place-items-center">
      {containerWidth > 0 && (
        <FrameStrip
          layout={layout}
          frame={frame}
          photos={Array(layout.poses).fill(null)}
          height={finalHeight}
          sample
        />
      )}
    </div>
  );
}
