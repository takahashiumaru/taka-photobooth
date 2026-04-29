"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { SIZES } from "@/lib/sizes";
import { LAYOUTS } from "@/lib/layouts";
import { usePhotoBooth } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";

export default function SizePage() {
  return (
    <HydrationGate>
      <Inner />
    </HydrationGate>
  );
}

function Inner() {
  const router = useRouter();
  const layoutId = usePhotoBooth((s) => s.layoutId);
  const sizeId = usePhotoBooth((s) => s.sizeId);
  const setSize = usePhotoBooth((s) => s.setSize);
  const layout = LAYOUTS.find((l) => l.id === layoutId);
  // Default to layout's natural size
  const naturalId =
    SIZES.find((s) => s.inchW === layout?.inchW && s.inchH === layout?.inchH)
      ?.id ?? null;
  const [selected, setSelected] = useState<string | null>(sizeId ?? naturalId);

  if (!layout) {
    if (typeof window !== "undefined") router.replace("/layout");
    return null;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-5 pb-24 pt-2">
        <div className="py-3 sm:py-6">
          <Stepper current={2} />
        </div>

        <div className="mb-5 sm:mb-8 text-center px-3">
          <span className="eyebrow text-[10px] sm:text-xs">Step 2 of 5</span>
          <h1 className="display-h2 mt-3 sm:mt-4 text-[28px] sm:text-5xl leading-[1.1]">
            Pick a size
          </h1>
          <p className="mx-auto mt-2 sm:mt-3 max-w-[20rem] sm:max-w-md text-[13px] sm:text-sm leading-relaxed text-ink/60">
            We default to the natural size of the {layout.name}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {SIZES.map((s) => {
            const active = selected === s.id;
            const isNatural = s.id === naturalId;
            // Normalize visual ratio
            const w = s.inchW;
            const h = s.inchH;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={clsx(
                  "group relative flex flex-col gap-4 rounded-3xl bg-white/70 p-5 text-left backdrop-blur-xl shadow-card transition-all hover:-translate-y-1",
                  active && "ring-2 ring-rose-500 shadow-glow -translate-y-1"
                )}
              >
                {isNatural && (
                  <span className="chip absolute right-4 top-4 bg-emerald-100 text-emerald-700">
                    Recommended
                  </span>
                )}
                <div className="relative flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-violet-50">
                  <div
                    className="rounded-md bg-white shadow-soft"
                    style={{
                      width: `${(w / Math.max(w, h)) * 110}px`,
                      height: `${(h / Math.max(w, h)) * 110}px`,
                      backgroundImage:
                        "linear-gradient(180deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px)",
                      backgroundSize: "100% 25%, 100% 100%",
                    }}
                  />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl italic font-light">{s.label}</p>
                    <p className="text-xs text-ink/55">{s.description}</p>
                  </div>
                  <div
                    className={clsx(
                      "h-6 w-6 shrink-0 rounded-full border-2 transition-all",
                      active ? "border-rose-500 bg-rose-500" : "border-black/15 bg-white"
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

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
            <button onClick={() => router.push("/layout")} className="btn-ghost">
              <ArrowLeft /> Back
            </button>
            <button
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                setSize(selected);
                router.push("/camera");
              }}
              className="btn-primary"
            >
              Continue to camera
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
