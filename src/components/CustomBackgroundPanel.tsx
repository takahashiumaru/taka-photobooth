"use client";

import clsx from "clsx";
import { useRef } from "react";
import type { CustomBg, CustomBgMode } from "@/lib/store";

type Props = {
  value: CustomBg;
  onChange: (patch: Partial<CustomBg>) => void;
};

const PRESET_COLORS = [
  "#FFE0EC",
  "#FFC2D2",
  "#FF9DB7",
  "#FFD6A5",
  "#FBE7C6",
  "#A0E7E5",
  "#B5DEFF",
  "#B49BFF",
  "#1A1326",
  "#FFFFFF",
];

const PRESET_GRADIENTS: Array<{ c1: string; c2: string; angle: number; label: string }> = [
  { c1: "#FFE0EC", c2: "#B49BFF", angle: 135, label: "Sakura" },
  { c1: "#A0E7E5", c2: "#B5DEFF", angle: 135, label: "Mint" },
  { c1: "#FBE7C6", c2: "#FFAEBC", angle: 135, label: "Sunset" },
  { c1: "#1A1326", c2: "#7C3AED", angle: 180, label: "Midnight" },
  { c1: "#FFD6A5", c2: "#FF6F94", angle: 90, label: "Peach" },
];

const MODES: Array<{ id: CustomBgMode; label: string }> = [
  { id: "transparent", label: "Transparent" },
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "image", label: "Image" },
];

export function CustomBackgroundPanel({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange({ image: dataUrl, mode: "image" });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-soft backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Custom background</p>
        {value.mode === "transparent" && (
          <span className="chip bg-emerald-100 text-emerald-700">PNG</span>
        )}
      </div>

      {/* Mode tabs */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-full bg-black/5 p-1 text-[11px] font-semibold uppercase tracking-wider">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange({ mode: m.id })}
            className={clsx(
              "rounded-full px-2 py-1.5 transition-all",
              value.mode === m.id
                ? "bg-white text-ink shadow-soft"
                : "text-ink/55 hover:text-ink"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific controls */}
      {value.mode === "transparent" && (
        <p className="text-xs text-ink/55">
          Hasil download akan otomatis dalam format <strong>PNG</strong> dengan alpha channel — sempurna
          untuk overlay di aplikasi lain.
        </p>
      )}

      {value.mode === "solid" && (
        <div className="space-y-3">
          <ColorRow
            label="Color"
            value={value.color1}
            onChange={(c) => onChange({ color1: c })}
          />
          <Presets
            colors={PRESET_COLORS}
            onPick={(c) => onChange({ color1: c })}
          />
        </div>
      )}

      {value.mode === "gradient" && (
        <div className="space-y-3">
          <ColorRow
            label="Color 1"
            value={value.color1}
            onChange={(c) => onChange({ color1: c })}
          />
          <ColorRow
            label="Color 2"
            value={value.color2}
            onChange={(c) => onChange({ color2: c })}
          />
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink/70">Angle</span>
              <span className="font-mono text-ink/55">{value.angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={value.angle}
              onChange={(e) => onChange({ angle: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-ink/70">Presets</p>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_GRADIENTS.map((g) => (
                <button
                  key={g.label}
                  onClick={() =>
                    onChange({
                      color1: g.c1,
                      color2: g.c2,
                      angle: g.angle,
                    })
                  }
                  title={g.label}
                  className="h-10 rounded-lg ring-1 ring-black/5 transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(${g.angle}deg, ${g.c1}, ${g.c2})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {value.mode === "image" && (
        <div className="space-y-3">
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
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/15 bg-white/60 p-4 text-sm text-ink/70 transition-all hover:border-rose-400 hover:text-ink"
          >
            <UploadIcon />
            {value.image ? "Replace image" : "Upload image"}
          </button>
          {value.image && (
            <>
              <div className="relative h-28 overflow-hidden rounded-xl ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.image}
                  alt="Custom background"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1 rounded-full bg-black/5 p-1">
                  <button
                    onClick={() => onChange({ imageFit: "cover" })}
                    className={clsx(
                      "rounded-full px-3 py-1 font-semibold uppercase tracking-wider",
                      value.imageFit === "cover"
                        ? "bg-white text-ink shadow-soft"
                        : "text-ink/55"
                    )}
                  >
                    Cover
                  </button>
                  <button
                    onClick={() => onChange({ imageFit: "contain" })}
                    className={clsx(
                      "rounded-full px-3 py-1 font-semibold uppercase tracking-wider",
                      value.imageFit === "contain"
                        ? "bg-white text-ink shadow-soft"
                        : "text-ink/55"
                    )}
                  >
                    Contain
                  </button>
                </div>
                <button
                  onClick={() => onChange({ image: null })}
                  className="text-ink/55 underline-offset-4 hover:underline"
                >
                  Remove image
                </button>
              </div>
              <ColorRow
                label="Fill behind"
                value={value.color1}
                onChange={(c) => onChange({ color1: c })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl bg-white/60 p-2 pl-3">
      <span className="text-xs font-medium text-ink/70">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-md border border-black/10 bg-white p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-md border border-black/5 bg-white/80 px-2 py-1 font-mono text-xs uppercase outline-none focus:border-rose-400"
        />
      </div>
    </label>
  );
}

function Presets({
  colors,
  onPick,
}: {
  colors: string[];
  onPick: (c: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-ink/70">Presets</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            title={c}
            className="h-7 w-7 rounded-full ring-1 ring-black/10 transition-all hover:scale-110"
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 17v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
    </svg>
  );
}
