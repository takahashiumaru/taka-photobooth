"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps MediaPipe ImageSegmenter (selfie segmenter). Loads the model from CDN
 * lazily so we don't block initial page render.
 *
 * Mobile note: on iOS Safari (and some Android browsers) the GPU delegate
 * fails to initialise because MediaPipe Tasks Vision needs full WebGL2 +
 * SharedArrayBuffer support which isn't always available. We try GPU first
 * but transparently fall back to CPU so background removal still works on
 * phones — just a bit slower.
 *
 * Init can take 10–30s on mobile data the first time (the WASM + model are
 * ~3 MB combined). We expose a timeout error and a manual retry so the user
 * isn't stuck on an indefinite spinner.
 */
export function useSegmentation(enabled: boolean) {
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);
  // Use any here because the type is loaded dynamically and we don't want to
  // pull MediaPipe types into the synchronous bundle.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segmenterRef = useRef<any>(null);

  const retry = useCallback(() => {
    setError(null);
    setReady(false);
    setRetryNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (segmenterRef.current) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const withTimeout = <T,>(p: Promise<T>, ms: number, label: string) =>
      Promise.race<T>([
        p,
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timed out: ${label} (>${ms / 1000}s)`)),
            ms
          )
        ),
      ]);

    (async () => {
      try {
        setError(null);
        const { ImageSegmenter, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await withTimeout(
          FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
          ),
          25_000,
          "downloading MediaPipe runtime"
        );

        // Mobile detection — both iOS and Android tend to be more reliable on
        // CPU because GPU delegates require WebGL2 + a Uint8Array mask
        // readback that isn't always supported in mobile browsers.
        const ua =
          typeof navigator !== "undefined" ? navigator.userAgent : "";
        const isMobile = /iPad|iPhone|iPod|Android/i.test(ua);

        const tryCreate = (delegate: "GPU" | "CPU") =>
          withTimeout(
            ImageSegmenter.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
                delegate,
              },
              runningMode: "VIDEO",
              outputCategoryMask: true,
              outputConfidenceMasks: false,
            }),
            25_000,
            `initialising ${delegate} segmenter`
          );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let segmenter: any = null;
        const order: ("GPU" | "CPU")[] = isMobile
          ? ["CPU", "GPU"]
          : ["GPU", "CPU"];
        let lastErr: unknown = null;
        for (const delegate of order) {
          try {
            segmenter = await tryCreate(delegate);
            break;
          } catch (err) {
            lastErr = err;
            console.warn(
              `[segmentation] Failed to init ${delegate} delegate:`,
              err
            );
          }
        }
        if (!segmenter) {
          throw new Error(
            (lastErr as Error)?.message ||
              "Could not initialise the background remover on this device."
          );
        }

        if (cancelled) {
          segmenter.close();
          return;
        }
        segmenterRef.current = segmenter;
        setReady(true);
      } catch (e) {
        const err = e as Error;
        console.error("[segmentation] init failed", err);
        if (!cancelled) {
          setError(err.message || "Failed to load the background remover.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, retryNonce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (segmenterRef.current) {
        try {
          segmenterRef.current.close();
        } catch {}
        segmenterRef.current = null;
      }
    };
  }, []);

  /**
   * Segment a video frame. Returns the categoryMask (Uint8Array) and dims.
   * Caller is responsible for applying it to a canvas.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function segment(video: HTMLVideoElement, ts: number): any | null {
    if (!segmenterRef.current) return null;
    try {
      return segmenterRef.current.segmentForVideo(video, ts);
    } catch (e) {
      console.warn("[segmentation] segmentForVideo failed", e);
      return null;
    }
  }

  return { ready, error, loading, retry, segment };
}
