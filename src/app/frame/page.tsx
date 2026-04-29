"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { LAYOUTS } from "@/lib/layouts";
import { FRAMES, getFrame } from "@/lib/frames";
import { FrameStrip } from "@/components/FrameStrip";
import { CustomBackgroundPanel } from "@/components/CustomBackgroundPanel";
import { usePhotoBooth } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";
import type { LayoutDef, FrameDef, CapturedPhoto } from "@/lib/types";
import type { CustomBg } from "@/lib/store";

const CATEGORIES = ["All", "Classic", "Decorative", "Themed"] as const;
type Cat = (typeof CATEGORIES)[number];

export default function FramePage() {
  return (
    <HydrationGate>
      <Inner />
    </HydrationGate>
  );
}

function Inner() {
  const router = useRouter();
  const layoutId = usePhotoBooth((s) => s.layoutId);
  const photos = usePhotoBooth((s) => s.photos);
  const frameId = usePhotoBooth((s) => s.frameId);
  const setFrame = usePhotoBooth((s) => s.setFrame);
  const customBg = usePhotoBooth((s) => s.customBg);
  const setCustomBg = usePhotoBooth((s) => s.setCustomBg);
  const resetPhotos = usePhotoBooth((s) => s.resetPhotos);

  const layout = LAYOUTS.find((l) => l.id === layoutId);
  const frame = getFrame(frameId);
  const [cat, setCat] = useState<Cat>("All");

  const filtered = useMemo(
    () => (cat === "All" ? FRAMES : FRAMES.filter((f) => f.category === cat)),
    [cat]
  );

  if (!layout) {
    if (typeof window !== "undefined") router.replace("/layout");
    return null;
  }

  if (!photos.length) {
    if (typeof window !== "undefined") router.replace("/camera");
    return null;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-5 pb-24 pt-2">
        <div className="py-3 sm:py-6">
          <Stepper current={4} />
        </div>

        <div className="mb-5 sm:mb-6 text-center px-3">
          <span className="eyebrow text-[10px] sm:text-xs">Step 4 of 5</span>
          <h1 className="display-h2 mt-3 sm:mt-4 text-[28px] sm:text-5xl leading-[1.1]">
            Choose a frame
          </h1>
          <p className="mx-auto mt-2 sm:mt-3 max-w-[20rem] sm:max-w-md text-[13px] sm:text-sm leading-relaxed text-ink/60">
            Swap frames freely — your photos stay locked in.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Preview + custom panel */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass p-3 sm:p-6">
              <FluidFrameStrip
                layout={layout}
                frame={frame}
                photos={photos}
                customBg={customBg}
              />
              <p className="mt-3 sm:mt-4 text-center font-display text-lg sm:text-xl italic">
                {frame.name}
              </p>
              <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.18em] text-ink/55">
                {frame.category}
              </p>
            </div>
            {frame.id === "custom" && (
              <CustomBackgroundPanel value={customBg} onChange={setCustomBg} />
            )}
          </div>

          {/* Frame grid */}
          <div>
            <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={clsx(
                    "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all",
                    cat === c
                      ? "bg-ink text-cream"
                      : "bg-white/70 text-ink/70 hover:bg-white"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((f) => {
                const active = frameId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFrame(f.id)}
                    className={clsx(
                      "group flex flex-col gap-2 rounded-2xl bg-white/70 p-3 text-left shadow-soft backdrop-blur-xl transition-all hover:-translate-y-0.5",
                      active && "ring-2 ring-rose-500 shadow-glow -translate-y-0.5"
                    )}
                  >
                    <div
                      className="relative h-24 rounded-xl"
                      style={{ background: f.swatch }}
                    >
                      <div className="absolute inset-2 rounded-md bg-white/85 grid grid-rows-3 gap-0.5 p-0.5">
                        <div className="rounded-sm bg-ink/20" />
                        <div className="rounded-sm bg-ink/20" />
                        <div className="rounded-sm bg-ink/20" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-ink">{f.name}</p>
                      {active && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          On
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
            <button
              onClick={() => {
                resetPhotos();
                router.push("/camera");
              }}
              className="btn-ghost"
            >
              <ArrowLeft /> Re-shoot
            </button>
            <button onClick={() => router.push("/result")} className="btn-primary">
              See result
              <ArrowRight />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

interface FluidFrameStripProps {
  layout: LayoutDef;
  frame: FrameDef;
  photos: CapturedPhoto[];
  customBg: CustomBg;
}

/**
 * Renders the FrameStrip preview at a height that always fits the parent
 * column. Uses a ResizeObserver so portrait strips stay tall on desktop
 * while square 6×6 grids never overflow the card on narrow phones.
 */
function FluidFrameStrip({
  layout,
  frame,
  photos,
  customBg,
}: FluidFrameStripProps) {
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
  const desktopMax = layout.kind === "strip" ? 560 : 420;
  const heightFromWidth =
    containerWidth > 0 ? containerWidth / aspect : desktopMax;
  const finalHeight = Math.max(
    220,
    Math.floor(Math.min(desktopMax, heightFromWidth))
  );

  return (
    <div
      ref={wrapRef}
      className="grid w-full place-items-center overflow-hidden"
    >
      {containerWidth > 0 && (
        <FrameStrip
          layout={layout}
          frame={frame}
          photos={photos.map((p) => p.dataUrl)}
          height={finalHeight}
          customBg={customBg}
        />
      )}
    </div>
  );
}
function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
