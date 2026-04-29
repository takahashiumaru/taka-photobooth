"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Header } from "@/components/Header";
import { Stepper } from "@/components/Stepper";
import { LAYOUTS } from "@/lib/layouts";
import { getFrame } from "@/lib/frames";
import { FILTERS } from "@/lib/filters";
import { FrameStrip } from "@/components/FrameStrip";
import { SceneCamera, type SceneCameraHandle } from "@/components/SceneCamera";
import { ScenePicker } from "@/components/ScenePicker";
import { getScene, type SceneId } from "@/lib/scenes";
import { usePhotoBooth } from "@/lib/store";
import { HydrationGate } from "@/components/HydrationGate";

export default function CameraPage() {
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
  const addPhoto = usePhotoBooth((s) => s.addPhoto);
  const retakeAt = usePhotoBooth((s) => s.retakeAt);
  const resetPhotos = usePhotoBooth((s) => s.resetPhotos);
  const mirror = usePhotoBooth((s) => s.mirror);
  const setMirror = usePhotoBooth((s) => s.setMirror);
  const filter = usePhotoBooth((s) => s.filter);
  const setFilter = usePhotoBooth((s) => s.setFilter);
  const countdown = usePhotoBooth((s) => s.countdown);
  const setCountdown = usePhotoBooth((s) => s.setCountdown);
  const frameId = usePhotoBooth((s) => s.frameId);

  const customBg = usePhotoBooth((s) => s.customBg);
  const bgRemoval = usePhotoBooth((s) => s.bgRemoval);
  const setBgRemoval = usePhotoBooth((s) => s.setBgRemoval);
  const sceneId = usePhotoBooth((s) => s.sceneId);
  const setSceneId = usePhotoBooth((s) => s.setSceneId);
  const customSceneImage = usePhotoBooth((s) => s.customSceneImage);
  const setCustomSceneImage = usePhotoBooth((s) => s.setCustomSceneImage);

  const layout = LAYOUTS.find((l) => l.id === layoutId);
  const frame = getFrame(frameId);
  const scene = getScene(sceneId as SceneId);
  const sceneBg = scene.id === "custom" ? "#1A1326" : scene.bg;
  const sceneCustomImg = scene.id === "custom" ? customSceneImage : null;

  const cameraRef = useRef<SceneCameraHandle>(null);
  const [permState, setPermState] = useState<"idle" | "granted" | "denied" | "loading">(
    "idle"
  );
  const [counting, setCounting] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [mobileTab, setMobileTab] = useState<"filter" | "backdrop" | "preview">(
    "filter"
  );

  useEffect(() => {
    if (!layout) {
      router.replace("/layout");
    }
  }, [layout, router]);

  function snap() {
    const handle = cameraRef.current;
    if (!handle) return;
    // Force PNG when transparent scene + bg removal so alpha is preserved.
    const isTransparent = bgRemoval && scene.bg === null;
    const dataUrl = handle.snap({
      format: isTransparent ? "png" : "jpeg",
      quality: 0.92,
    });
    if (!dataUrl) return;
    addPhoto({ dataUrl, takenAt: Date.now() });
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
  }

  async function startCountdown() {
    if (counting !== null) return;
    if (!layout) return;
    if (photos.length >= layout.poses) return;
    if (countdown === 0) {
      snap();
      return;
    }
    let n = countdown;
    setCounting(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCounting(null);
        snap();
      } else {
        setCounting(n);
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }

  // Auto-advance: only when user has just completed (avoid loop when entering
  // /camera with photos already full from a previous session).
  const prevCount = useRef(photos.length);
  useEffect(() => {
    if (!layout) return;
    const justFinished =
      photos.length === layout.poses && photos.length > prevCount.current;
    prevCount.current = photos.length;
    if (justFinished && !advanced) {
      setAdvanced(true);
      const t = setTimeout(() => router.push("/frame"), 700);
      return () => clearTimeout(t);
    }
  }, [photos.length, layout, router, advanced]);

  if (!layout) return null;

  const currentIdx = photos.length;
  const filterCss = FILTERS.find((f) => f.id === filter)?.css ?? "none";
  const isFull = photos.length >= layout.poses;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-3 sm:px-5 pb-10 sm:pb-24 pt-2">
        <div className="py-2 sm:py-6">
          <Stepper current={3} />
        </div>

        {/* Compact mobile heading */}
        <div className="mb-2 sm:mb-6 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="hidden sm:inline eyebrow">Step 3 of 5</span>
            <h1 className="display-h2 sm:mt-2 text-xl sm:text-5xl truncate">
              Strike a pose
            </h1>
            <p className="hidden sm:block mt-1 text-sm text-ink/60">
              Take {layout.poses} shots. We&apos;ll keep them for you.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 rounded-full bg-white/80 p-0.5 sm:p-1.5 shadow-soft backdrop-blur-xl">
            <span className="px-2 sm:px-3 text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-ink/60">
              Photo
            </span>
            <span className="rounded-full bg-gradient-to-br from-rose-500 to-plum-600 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold text-white">
              {Math.min(currentIdx + 1, layout.poses)}/{layout.poses}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Camera column — mobile uses flex-col with viewport-bound height
              so SNAP + mirror + timer stay above the fold */}
          <div className="relative flex flex-col">
            <div className="relative h-[48dvh] max-h-[440px] sm:h-auto sm:max-h-none sm:aspect-[4/3] overflow-hidden rounded-3xl bg-ink shadow-card">
              <SceneCamera
                ref={cameraRef}
                bgRemoval={bgRemoval}
                sceneBg={sceneBg}
                sceneImage={sceneCustomImg}
                mirror={mirror}
                filter={filterCss}
                onPermissionChange={(state) => setPermState(state)}
              />

              {/* All photos taken — offer reset */}
              {isFull && permState === "granted" && (
                <div className="absolute inset-0 grid place-items-center bg-ink/70 p-6 text-center text-cream backdrop-blur-sm">
                  <div>
                    <p className="font-display text-2xl italic">All shots taken</p>
                    <p className="mt-2 text-sm text-cream/70">
                      Continue to choose a frame, or reset to retake all.
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          resetPhotos();
                          setAdvanced(false);
                        }}
                      >
                        Reset & retake
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => router.push("/frame")}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown */}
              {counting !== null && (
                <div className="absolute inset-0 grid place-items-center bg-black/40">
                  <div className="animate-pop font-display text-[120px] leading-none text-white drop-shadow-2xl">
                    {counting}
                  </div>
                </div>
              )}

              {/* Flash */}
              {flash && <div className="absolute inset-0 bg-white animate-pop" />}

              {/* Top bar */}
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className="pill bg-white/85 text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </span>
                <span className="pill bg-white/85 text-ink hidden sm:inline-flex">
                  {layout.name}
                </span>
              </div>
            </div>

            {/* Action row 1: Mirror | SNAP | Retake */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => setMirror(!mirror)}
                className={clsx(
                  "rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider shadow-soft backdrop-blur-md transition-all",
                  mirror
                    ? "bg-gradient-to-br from-rose-500 to-plum-600 text-white"
                    : "bg-white/80 text-ink/60"
                )}
              >
                Mirror
              </button>

              <button
                onClick={startCountdown}
                disabled={
                  permState !== "granted" || counting !== null || photos.length >= layout.poses
                }
                className={clsx(
                  "group relative grid h-16 w-16 sm:h-[72px] sm:w-[72px] place-items-center rounded-full bg-white shadow-glow transition-all hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label="Take photo"
              >
                <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-plum-600 text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                </span>
              </button>

              <button
                onClick={() => photos.length > 0 && retakeAt(photos.length - 1)}
                disabled={photos.length === 0}
                className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink/70 shadow-soft backdrop-blur-md transition hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                title="Retake last photo"
                aria-label="Retake last"
              >
                <span className="text-base leading-none">↺</span>
                <span className="hidden xs:inline sm:inline">Retake</span>
              </button>
            </div>

            {/* Action row 2: Timer pills (centered) */}
            <div className="mt-2 flex justify-center">
              <div className="flex items-center gap-0.5 rounded-full bg-white/80 p-1 shadow-soft backdrop-blur-md">
                <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-ink/50">
                  Timer
                </span>
                <CountdownPicker
                  value={countdown}
                  onChange={setCountdown}
                />
              </div>
            </div>

            {/* Mobile tabs (Filter / Backdrop / Preview) — desktop hides this */}
            <div className="mt-4 w-full lg:hidden">
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/70 p-1 shadow-soft backdrop-blur-md">
                {([
                  { id: "filter", label: "Filter" },
                  { id: "backdrop", label: "Scene" },
                  { id: "preview", label: "Preview" },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMobileTab(t.id)}
                    className={clsx(
                      "w-full rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wider transition-all",
                      mobileTab === t.id
                        ? "bg-gradient-to-br from-rose-500 to-plum-600 text-white shadow-soft"
                        : "text-ink/60"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                {mobileTab === "filter" && (
                  <div className="rounded-3xl bg-white/75 p-3 shadow-soft backdrop-blur-xl">
                    <div className="grid grid-cols-4 gap-2">
                      {FILTERS.map((f) => (
                        <FilterChip
                          key={f.id}
                          name={f.name}
                          css={f.css}
                          active={filter === f.id}
                          onClick={() => setFilter(f.id)}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}
                {mobileTab === "backdrop" && (
                  <ScenePicker
                    enabled={bgRemoval}
                    onToggle={setBgRemoval}
                    sceneId={sceneId}
                    onSceneChange={setSceneId}
                    customImage={customSceneImage}
                    onCustomImageChange={setCustomSceneImage}
                  />
                )}
                {mobileTab === "preview" && (
                  <div className="glass p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="eyebrow">Live preview</p>
                      <p className="text-xs text-ink/55">
                        {photos.length}/{layout.poses}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <FrameStrip
                        layout={layout}
                        frame={frame}
                        photos={[
                          ...photos.map((p) => p.dataUrl),
                          ...Array(
                            Math.max(0, layout.poses - photos.length)
                          ).fill(null),
                        ]}
                        height={layout.kind === "strip" ? 320 : 240}
                        highlightIndex={currentIdx}
                        customBg={customBg}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => resetPhotos()}
                  className="text-xs font-medium text-ink/55 underline-offset-4 hover:underline"
                >
                  Reset all photos
                </button>
                <span className="text-xs text-ink/30">·</span>
                <button
                  onClick={() => router.push("/size")}
                  className="text-xs font-medium text-ink/55 underline-offset-4 hover:underline"
                >
                  ← Change size
                </button>
              </div>
            </div>

            {/* Desktop filter strip */}
            <div className="no-scrollbar mt-4 -mx-1 hidden lg:flex gap-2 overflow-x-auto px-1 pb-1">
              {FILTERS.map((f) => (
                <FilterChip
                  key={f.id}
                  name={f.name}
                  css={f.css}
                  active={filter === f.id}
                  onClick={() => setFilter(f.id)}
                />
              ))}
            </div>

            <div className="mt-3 hidden lg:flex items-center gap-2">
              <button
                onClick={() => resetPhotos()}
                className="text-xs font-medium text-ink/55 underline-offset-4 hover:underline"
              >
                Reset all photos
              </button>
              <span className="text-xs text-ink/30">·</span>
              <button
                onClick={() => router.push("/size")}
                className="text-xs font-medium text-ink/55 underline-offset-4 hover:underline"
              >
                ← Change size
              </button>
            </div>
          </div>

          {/* Desktop-only aside: live preview + scene picker (hidden on mobile, has tabs) */}
          <aside className="hidden lg:block space-y-4">
            <div className="glass p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Live preview</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {photos.length}/{layout.poses} captured
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <FrameStrip
                  layout={layout}
                  frame={frame}
                  photos={[
                    ...photos.map((p) => p.dataUrl),
                    ...Array(Math.max(0, layout.poses - photos.length)).fill(null),
                  ]}
                  height={layout.kind === "strip" ? 360 : 280}
                  highlightIndex={currentIdx}
                  customBg={customBg}
                />
              </div>
            </div>

            <ScenePicker
              enabled={bgRemoval}
              onToggle={setBgRemoval}
              sceneId={sceneId}
              onSceneChange={setSceneId}
              customImage={customSceneImage}
              onCustomImageChange={setCustomSceneImage}
            />
          </aside>
        </div>
      </main>
    </>
  );
}

function FilterChip({
  name,
  css,
  active,
  onClick,
  compact = false,
}: {
  name: string;
  css: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-2xl border-2 bg-white/70 p-1 transition-all",
        compact ? "w-full" : "shrink-0",
        active ? "border-rose-500 shadow-soft" : "border-transparent"
      )}
      title={name}
    >
      <div
        className={clsx(
          "mx-auto rounded-xl bg-cover bg-center",
          compact ? "h-10 w-full" : "h-10 w-14 sm:h-12 sm:w-16"
        )}
        style={{
          filter: css,
          backgroundImage:
            "linear-gradient(135deg,#FFB6C1,#FFD6A5,#A0E7E5)",
        }}
      />
      <p className="mt-1 text-center text-[9px] font-medium leading-tight text-ink/70 truncate px-0.5">
        {name}
      </p>
    </button>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all",
        on
          ? "bg-gradient-to-br from-rose-500 to-plum-600 text-white shadow-soft"
          : "bg-transparent text-ink/55"
      )}
    >
      {label}
    </button>
  );
}

function CountdownPicker({
  value,
  onChange,
}: {
  value: 0 | 3 | 5 | 10;
  onChange: (v: 0 | 3 | 5 | 10) => void;
}) {
  const opts: (0 | 3 | 5 | 10)[] = [0, 3, 5, 10];
  return (
    <div className="flex items-center gap-1 px-1 text-[11px] font-semibold text-ink/55">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx(
            "min-w-7 rounded-full px-2 py-1 transition-all",
            value === o
              ? "bg-ink text-cream"
              : "bg-transparent hover:bg-ink/5"
          )}
        >
          {o === 0 ? "OFF" : `${o}s`}
        </button>
      ))}
    </div>
  );
}
