"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps MediaPipe ImageSegmenter (selfie segmenter). Loads the model from CDN
 * lazily so we don't block initial page render. Returns a function that
 * segments an HTMLVideoElement and returns a binary mask canvas (white =
 * person, black = background).
 */
export function useSegmentation(enabled: boolean) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use any here because the type is loaded dynamically and we don't want to
  // pull MediaPipe types into the synchronous bundle.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segmenterRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    if (segmenterRef.current) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { ImageSegmenter, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
        if (cancelled) {
          segmenter.close();
          return;
        }
        segmenterRef.current = segmenter;
        setReady(true);
      } catch (e) {
        const err = e as Error;
        setError(err.message || "Failed to load segmentation model");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

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
    } catch {
      return null;
    }
  }

  return { ready, error, segment };
}
