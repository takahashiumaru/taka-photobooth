"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { LAYOUTS } from "@/lib/layouts";
import { getFrame } from "@/lib/frames";
import { FrameStrip } from "@/components/FrameStrip";
import { usePhotoBooth } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";
import { renderStrip } from "@/lib/render";

export default function ResultPage() {
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
  const customBg = usePhotoBooth((s) => s.customBg);
  const reset = usePhotoBooth((s) => s.reset);
  const resetPhotos = usePhotoBooth((s) => s.resetPhotos);

  const layout = LAYOUTS.find((l) => l.id === layoutId);
  const frame = getFrame(frameId);

  const [busy, setBusy] = useState<null | "jpeg" | "png">(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const isTransparent = frameId === "custom" && customBg.mode === "transparent";

  // Generate a thumbnail at low DPI for the hero card (so user sees print-quality preview)
  useEffect(() => {
    if (!layout) return;
    let cancelled = false;
    (async () => {
      try {
        const { canvas, transparent } = await renderStrip({
          layout,
          frame,
          photos: photos.map((p) => p.dataUrl),
          customBg,
          dpi: 100,
          format: isTransparent ? "png" : "jpeg",
          quality: 0.92,
        });
        if (!cancelled)
          setThumb(
            canvas.toDataURL(
              transparent ? "image/png" : "image/jpeg",
              0.92
            )
          );
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [layout, frame, photos, customBg]);

  if (!layout) {
    if (typeof window !== "undefined") router.replace("/layout");
    return null;
  }
  if (!photos.length) {
    if (typeof window !== "undefined") router.replace("/camera");
    return null;
  }

  async function download(format: "jpeg" | "png") {
    if (!layout) return;
    setBusy(format);
    try {
      const { blob, transparent } = await renderStrip({
        layout,
        frame,
        photos: photos.map((p) => p.dataUrl),
        customBg,
        dpi: 300,
        format,
        quality: 0.95,
      });
      const ext = transparent || format === "png" ? "png" : "jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      a.href = url;
      a.download = `takaphotobooth_${ts}_${layout.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-2">
        <div className="py-6">
          <Stepper current={5} />
        </div>

        <div className="mb-8 text-center">
          <span className="eyebrow">Step 5 of 5</span>
          <h1 className="display-h2 mt-2">Your strip is ready</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            Print quality 300 DPI. Download as JPG or PNG, or keep tweaking.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Hero preview */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[60px] bg-gradient-to-br from-rose-200/60 via-white/40 to-plum-200/60 blur-2xl" />
            <div className="flex items-center justify-center">
              <FrameStrip
                layout={layout}
                frame={frame}
                photos={photos.map((p) => p.dataUrl)}
                height={layout.kind === "strip" ? 620 : 440}
                customBg={customBg}
              />
            </div>
            {thumb && (
              <div className="mt-4 flex items-center justify-center text-xs text-ink/45">
                Print-ready · {layout.inchW}″ × {layout.inchH}″ @ 300 DPI
              </div>
            )}
          </div>

          {/* Actions */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass p-6">
              <p className="eyebrow">Download</p>
              <h2 className="display-h2 mt-1 text-3xl">Save your memory</h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => download(isTransparent ? "png" : "jpeg")}
                  disabled={busy !== null}
                  className="btn-primary"
                >
                  {busy ? "Saving…" : isTransparent ? "Download PNG" : "Download JPG"}
                </button>
                <button
                  onClick={() => download("png")}
                  disabled={busy !== null || isTransparent}
                  className="btn-ghost border-2 border-ink/10"
                >
                  {busy === "png" ? "Saving…" : "Download PNG"}
                </button>
              </div>
              {isTransparent && (
                <p className="mt-2 text-xs text-ink/55">
                  Background transparan tersedia hanya dalam <strong>PNG</strong> (JPG tidak
                  mendukung alpha).
                </p>
              )}

              <hr className="my-5 border-black/5" />

              <p className="eyebrow">Keep going</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/frame")}
                  className="flex items-center justify-between rounded-2xl bg-white/60 p-3 text-sm hover:bg-white"
                >
                  <span>Change frame</span>
                  <span className="text-ink/40">→</span>
                </button>
                <button
                  onClick={() => {
                    resetPhotos();
                    router.push("/camera");
                  }}
                  className="flex items-center justify-between rounded-2xl bg-white/60 p-3 text-sm hover:bg-white"
                >
                  <span>Retake photos</span>
                  <span className="text-ink/40">→</span>
                </button>
                <button
                  onClick={() => {
                    reset();
                    router.push("/");
                  }}
                  className="flex items-center justify-between rounded-2xl bg-white/60 p-3 text-sm hover:bg-white"
                >
                  <span>Start a new session</span>
                  <span className="text-ink/40">→</span>
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-white/60 p-4 text-xs text-ink/55 shadow-soft">
              Your photos never left this browser. Reload the page or clear it
              when you&apos;re done — we won&apos;t remember a thing.
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
