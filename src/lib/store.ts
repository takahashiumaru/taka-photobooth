"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CapturedPhoto } from "./types";

type StepNumber = 1 | 2 | 3 | 4 | 5;

export type CustomBgMode = "transparent" | "solid" | "gradient" | "image";

export interface CustomBg {
  mode: CustomBgMode;
  color1: string;
  color2: string;
  angle: number; // gradient angle in degrees
  image: string | null; // dataURL
  imageFit: "cover" | "contain";
}

interface PhotoBoothState {
  layoutId: string | null;
  sizeId: string | null;
  photos: CapturedPhoto[];
  frameId: string;
  mirror: boolean;
  filter: string; // CSS filter applied during capture preview
  countdown: 3 | 5 | 10 | 0;
  step: StepNumber;
  customBg: CustomBg;
  bgRemoval: boolean;
  sceneId: string;
  customSceneImage: string | null;

  setLayout: (id: string) => void;
  setSize: (id: string) => void;
  addPhoto: (p: CapturedPhoto) => void;
  retakeAt: (index: number) => void;
  resetPhotos: () => void;
  setFrame: (id: string) => void;
  setMirror: (v: boolean) => void;
  setFilter: (v: string) => void;
  setCountdown: (v: 3 | 5 | 10 | 0) => void;
  setStep: (v: StepNumber) => void;
  setCustomBg: (patch: Partial<CustomBg>) => void;
  setBgRemoval: (v: boolean) => void;
  setSceneId: (id: string) => void;
  setCustomSceneImage: (img: string | null) => void;
  reset: () => void;
}

export const usePhotoBooth = create<PhotoBoothState>()(
  persist(
    (set) => ({
      layoutId: null,
      sizeId: null,
      photos: [],
      frameId: "ivory",
      mirror: true,
      filter: "none",
      countdown: 3,
      step: 1,
      customBg: {
        mode: "transparent",
        color1: "#FFE0EC",
        color2: "#B49BFF",
        angle: 135,
        image: null,
        imageFit: "cover",
      },
      bgRemoval: false,
      sceneId: "studio-cream",
      customSceneImage: null,
      setLayout: (id) => set({ layoutId: id, step: 2 }),
      setSize: (id) => set({ sizeId: id, step: 3 }),
      addPhoto: (p) =>
        set((s) => ({ photos: [...s.photos, p] })),
      retakeAt: (index) =>
        set((s) => ({ photos: s.photos.slice(0, index) })),
      resetPhotos: () => set({ photos: [] }),
      setFrame: (id) => set({ frameId: id }),
      setMirror: (v) => set({ mirror: v }),
      setFilter: (v) => set({ filter: v }),
      setCountdown: (v) => set({ countdown: v }),
      setStep: (v) => set({ step: v }),
      setCustomBg: (patch) =>
        set((s) => ({ customBg: { ...s.customBg, ...patch } })),
      setBgRemoval: (v) => set({ bgRemoval: v }),
      setSceneId: (id) => set({ sceneId: id }),
      setCustomSceneImage: (img) => set({ customSceneImage: img }),
      reset: () =>
        set({
          layoutId: null,
          sizeId: null,
          photos: [],
          frameId: "ivory",
          step: 1,
          filter: "none",
        }),
    }),
    {
      name: "takaphotobooth-store",
      // Don't persist photos to avoid quota issues
      partialize: (s) => ({
        layoutId: s.layoutId,
        sizeId: s.sizeId,
        frameId: s.frameId,
        mirror: s.mirror,
        countdown: s.countdown,
        filter: s.filter,
        // Persist custom bg config but not the uploaded image dataURL
        // (could exceed localStorage quota).
        customBg: { ...s.customBg, image: null },
        bgRemoval: s.bgRemoval,
        sceneId: s.sceneId,
      }),
    }
  )
);
