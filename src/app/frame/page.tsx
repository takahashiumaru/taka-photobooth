"use client";

import { useMemo, useState } from "react";
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
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-2">
        <div className="py-6">
          <Stepper current={4} />
        </div>

        <div className="mb-6 text-center">
          <span className="eyebrow">Step 4 of 5</span>
          <h1 className="display-h2 mt-2">Choose a frame</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            Swap frames freely — your photos stay locked in.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Preview + custom panel */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass p-6">
              <div className="flex items-center justify-center">
                <FrameStrip
                  layout={layout}
                  frame={frame}
                  photos={photos.map((p) => p.dataUrl)}
                  height={layout.kind === "strip" ? 560 : 420}
                  customBg={customBg}
                />
              </div>
              <p className="mt-4 text-center font-display text-xl italic">
                {frame.name}
              </p>
              <p className="text-center text-xs uppercase tracking-[0.18em] text-ink/55">
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
function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
