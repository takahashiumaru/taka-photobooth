"use client";

import clsx from "clsx";
import { useRef } from "react";
import { SCENES, type SceneCategory } from "@/lib/scenes";

type Props = {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  sceneId: string;
  onSceneChange: (id: string) => void;
  customImage: string | null;
  onCustomImageChange: (img: string | null) => void;
};

const CATEGORIES: SceneCategory[] = ["Studio", "Curtain", "Gradient", "Special"];

export function ScenePicker({
  enabled,
  onToggle,
  sceneId,
  onSceneChange,
  customImage,
  onCustomImageChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => {
      onCustomImageChange(r.result as string);
      onSceneChange("custom");
    };
    r.readAsDataURL(file);
  }

  return (
    <div className="rounded-3xl bg-white/75 p-4 shadow-soft backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="eyebrow">Backdrop</p>
          <p className="text-xs text-ink/55">
            Hapus background asli, ganti scene baru. Real-time, on-device.
          </p>
        </div>
        <Switch checked={enabled} onChange={onToggle} />
      </div>

      <div
        className={clsx(
          "transition-opacity",
          enabled ? "opacity-100" : "pointer-events-none opacity-40"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {CATEGORIES.map((cat) => {
          const items = SCENES.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                {cat}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {items.map((s) => {
                  const active = s.id === sceneId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (s.id === "custom" && !customImage) {
                          fileRef.current?.click();
                        } else {
                          onSceneChange(s.id);
                        }
                      }}
                      title={s.name}
                      className={clsx(
                        "relative h-14 overflow-hidden rounded-xl ring-1 ring-black/5 transition-all hover:scale-[1.03]",
                        active && "ring-2 ring-rose-500 ring-offset-2 ring-offset-white/70"
                      )}
                      style={{
                        background:
                          s.id === "custom" && customImage
                            ? `url("${customImage}") center/cover`
                            : s.swatch,
                      }}
                    >
                      {s.id === "custom" && !customImage && (
                        <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-ink/70">
                          + Upload
                        </span>
                      )}
                      {active && (
                        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {sceneId === "custom" && customImage && (
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full rounded-xl border border-dashed border-ink/15 p-2 text-xs text-ink/55 transition hover:border-rose-400 hover:text-ink"
          >
            Replace custom image
          </button>
        )}
      </div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-7 w-12 rounded-full transition-colors",
        checked ? "bg-rose-500" : "bg-ink/15"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      >
        {checked && (
          <span className="text-[10px] font-bold text-rose-500">ON</span>
        )}
      </span>
    </button>
  );
}
