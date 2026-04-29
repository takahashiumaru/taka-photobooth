"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useSegmentation } from "@/hooks/useSegmentation";

export type SceneCameraHandle = {
  /** Capture the current displayed frame as a JPEG (or PNG if transparent) data URL */
  snap: (opts?: { format?: "jpeg" | "png"; quality?: number }) => string | null;
  /** True when the camera & (if enabled) segmentation pipeline is ready */
  ready: () => boolean;
};

type Props = {
  /** Whether to enable background removal pipeline */
  bgRemoval: boolean;
  /** CSS background string used when bgRemoval=true. null = transparent */
  sceneBg: string | null;
  /** Optional override image (dataURL) painted on top of `sceneBg` */
  sceneImage: string | null;
  mirror: boolean;
  /** CSS filter applied to person/video */
  filter: string;
  onPermissionChange?: (state: "idle" | "granted" | "denied" | "loading", err?: string) => void;
};

export const SceneCamera = forwardRef<SceneCameraHandle, Props>(function SceneCamera(
  { bgRemoval, sceneBg, sceneImage, mirror, filter, onPermissionChange },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sceneImgRef = useRef<HTMLImageElement | null>(null);
  const sceneBgImgRef = useRef<HTMLImageElement | null>(null);
  const sceneBgCachedRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const [permState, setPermState] = useState<"idle" | "granted" | "denied" | "loading">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const {
    ready: segReady,
    error: segError,
    loading: segLoading,
    retry: segRetry,
    segment,
  } = useSegmentation(bgRemoval);

  // Camera lifecycle
  useEffect(() => {
    let cancelled = false;
    async function start() {
      setPermState("loading");
      onPermissionChange?.("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 },
            facingMode: "user",
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPermState("granted");
        onPermissionChange?.("granted");
      } catch (e) {
        const err = e as Error;
        setErrMsg(err.message || "Camera access denied");
        setPermState("denied");
        onPermissionChange?.("denied", err.message);
      }
    }
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-render scene background to an offscreen image. We render the CSS
  // background-string (curtain url, gradient, solid) to an SVG foreignObject so
  // it can be drawn onto the canvas. Cache by sceneBg string.
  useEffect(() => {
    if (sceneBg === null) {
      sceneBgImgRef.current = null;
      sceneBgCachedRef.current = null;
      return;
    }
    if (sceneBgCachedRef.current === sceneBg) return;
    sceneBgCachedRef.current = sceneBg;
    const W = 1280;
    const H = 960;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;height:${H}px;background:${sceneBg.replace(/"/g, "&quot;")}"></div>
      </foreignObject>
    </svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const img = new Image();
    img.onload = () => {
      // Only commit if still latest.
      if (sceneBgCachedRef.current === sceneBg) {
        sceneBgImgRef.current = img;
      }
    };
    img.src = url;
  }, [sceneBg]);

  // Pre-load scene image (custom upload).
  useEffect(() => {
    if (!sceneImage) {
      sceneImgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      sceneImgRef.current = img;
    };
    img.src = sceneImage;
  }, [sceneImage]);

  // Render loop: composites video onto canvas (with optional segmentation).
  useEffect(() => {
    let stop = false;
    function loop() {
      if (stop) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && video.videoWidth) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.clearRect(0, 0, w, h);
          if (mirror) {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
          }

          if (bgRemoval && segReady) {
            // 1) Run segmentation on the current frame
            const result = segment(video, performance.now());
            // 2) Paint background scene first (or leave transparent)
            if (sceneBg !== null) {
              if (sceneBgImgRef.current) {
                drawCover(ctx, sceneBgImgRef.current, 0, 0, w, h);
              }
              if (sceneImgRef.current) {
                drawCover(ctx, sceneImgRef.current, 0, 0, w, h);
              }
            }
            // 3) Apply filter and draw person via mask
            ctx.filter = filter;
            drawSegmented(ctx, video, result, w, h);
            ctx.filter = "none";
          } else {
            ctx.filter = filter;
            ctx.drawImage(video, 0, 0, w, h);
            ctx.filter = "none";
          }
          ctx.restore();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      stop = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bgRemoval, sceneBg, segReady, segment, mirror, filter]);

  useImperativeHandle(ref, () => ({
    snap: (opts) => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.width) return null;
      const fmt = opts?.format ?? (sceneBg === null && bgRemoval ? "png" : "jpeg");
      const q = opts?.quality ?? 0.92;
      return canvas.toDataURL(fmt === "png" ? "image/png" : "image/jpeg", q);
    },
    ready: () => permState === "granted" && (!bgRemoval || segReady),
  }));

  return (
    <>
      {/* Hidden source video — pipeline reads pixels from this */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute -z-10 h-1 w-1 opacity-0"
        aria-hidden
      />
      {/* Visible composited canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover"
        style={{
          background: sceneBg === null && bgRemoval
            ? "repeating-conic-gradient(rgba(255,255,255,0.10) 0% 25%, rgba(255,255,255,0.04) 0% 50%) 0 0/24px 24px"
            : undefined,
        }}
      />
      {/* Permission overlay */}
      {permState !== "granted" && (
        <div className="absolute inset-0 grid place-items-center bg-ink/90 p-6 text-center text-cream">
          {permState === "loading" && <p>Asking for camera permission…</p>}
          {permState === "denied" && (
            <div>
              <p className="font-display text-2xl italic">Camera blocked</p>
              <p className="mt-2 text-sm text-cream/70">
                {errMsg ?? "Please allow camera access in your browser settings."}
              </p>
              <button
                className="btn-ghost mt-4"
                onClick={() => location.reload()}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
      {/* Loading segmenter — first load can take 10–30s on mobile data */}
      {bgRemoval && permState === "granted" && segLoading && !segError && (
        <div className="absolute left-3 right-3 top-3 rounded-2xl bg-ink/85 p-3 text-[11px] font-medium text-cream shadow-soft backdrop-blur-md">
          <div className="mb-0.5 font-bold uppercase tracking-wider">
            Loading background remover…
          </div>
          <p className="leading-snug opacity-80">
            First load downloads ~3 MB. On mobile it can take 10–30 seconds.
          </p>
        </div>
      )}
      {/* Segmenter error with retry (e.g. iOS WebGL / slow network) */}
      {bgRemoval && segError && (
        <div className="absolute left-3 right-3 top-3 rounded-2xl bg-rose-500/95 p-3 text-[11px] font-medium text-white shadow-soft backdrop-blur-md">
          <div className="mb-1 font-bold uppercase tracking-wider">
            Background remover unavailable
          </div>
          <p className="mb-2 leading-snug">{segError}</p>
          <button
            type="button"
            onClick={segRetry}
            className="rounded-full bg-white/20 px-3 py-1 font-semibold text-white transition hover:bg-white/30"
          >
            Try again
          </button>
        </div>
      )}
    </>
  );
});

// ---------- Helpers ----------

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  // @ts-expect-error - both Image and HTMLVideoElement have width/height props
  const iw = img.naturalWidth ?? img.videoWidth ?? img.width;
  // @ts-expect-error
  const ih = img.naturalHeight ?? img.videoHeight ?? img.height;
  if (!iw || !ih) return;
  const ar = iw / ih;
  const dar = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;
  if (ar > dar) {
    sw = ih * dar;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / dar;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * Draw the segmented foreground (person) from `video` onto `ctx`, using the
 * MediaPipe categoryMask to keep only person pixels and feathering edges.
 */
function drawSegmented(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any | null,
  w: number,
  h: number
) {
  if (!result || !result.categoryMask) {
    // Fallback: draw raw video
    ctx.drawImage(video, 0, 0, w, h);
    return;
  }
  const mask = result.categoryMask;
  const mw = mask.width;
  const mh = mask.height;
  // categoryMask is GPU-backed; getAsUint8Array() gives us the raw classes.
  const data: Uint8Array = mask.getAsUint8Array();

  // Build an alpha-only ImageData from the mask, where person == 0 (foreground).
  // Selfie segmenter labels: 0 = person/foreground, 1 = background.
  const maskCanvas = getMaskCanvas(mw, mh);
  const mctx = maskCanvas.getContext("2d")!;
  const imageData = mctx.createImageData(mw, mh);
  const buf = imageData.data;
  for (let i = 0; i < data.length; i++) {
    const isPerson = data[i] === 0;
    const j = i * 4;
    buf[j] = 255;
    buf[j + 1] = 255;
    buf[j + 2] = 255;
    buf[j + 3] = isPerson ? 255 : 0;
  }
  mctx.putImageData(imageData, 0, 0);

  // Feather mask slightly to soften edges
  ctx.save();
  // Draw mask scaled to canvas
  // 1) Stamp mask as alpha by drawing it then using "source-in" to draw video
  const tmp = getTmpCanvas(w, h);
  const tctx = tmp.getContext("2d")!;
  tctx.clearRect(0, 0, w, h);
  // Slight blur on mask edges
  tctx.filter = "blur(2px)";
  tctx.drawImage(maskCanvas, 0, 0, w, h);
  tctx.filter = "none";
  // Draw video only where mask alpha is set
  tctx.globalCompositeOperation = "source-in";
  tctx.drawImage(video, 0, 0, w, h);
  tctx.globalCompositeOperation = "source-over";
  // Composite result onto main ctx
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

let _maskCanvas: HTMLCanvasElement | null = null;
function getMaskCanvas(w: number, h: number) {
  if (!_maskCanvas) _maskCanvas = document.createElement("canvas");
  if (_maskCanvas.width !== w) _maskCanvas.width = w;
  if (_maskCanvas.height !== h) _maskCanvas.height = h;
  return _maskCanvas;
}

let _tmpCanvas: HTMLCanvasElement | null = null;
function getTmpCanvas(w: number, h: number) {
  if (!_tmpCanvas) _tmpCanvas = document.createElement("canvas");
  if (_tmpCanvas.width !== w) _tmpCanvas.width = w;
  if (_tmpCanvas.height !== h) _tmpCanvas.height = h;
  return _tmpCanvas;
}
