"use client";

import clsx from "clsx";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Layout", href: "/layout" },
  { id: 2, label: "Size", href: "/size" },
  { id: 3, label: "Camera", href: "/camera" },
  { id: 4, label: "Frame", href: "/frame" },
  { id: 5, label: "Result", href: "/result" },
];

export function Stepper({ current }: { current: number }) {
  return (
    <nav className="mx-auto flex w-full max-w-3xl items-center justify-center gap-1 px-2">
      {STEPS.map((s, i) => {
        const active = current === s.id;
        const done = current > s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <Link
              href={done ? s.href : "#"}
              className={clsx(
                "group flex w-full flex-col items-center gap-1.5 rounded-full px-2 py-1",
                done && "cursor-pointer"
              )}
            >
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={clsx(
                      "h-px flex-1",
                      done || active
                        ? "bg-gradient-to-r from-rose-400 to-plum-500"
                        : "bg-black/10"
                    )}
                  />
                )}
                <div
                  className={clsx(
                    "flex h-7 min-w-7 items-center justify-center rounded-full text-[11px] font-bold",
                    active &&
                      "bg-gradient-to-br from-rose-500 to-plum-600 text-white shadow-soft scale-110",
                    done && !active && "bg-plum-600 text-white",
                    !active && !done && "bg-white/80 text-ink/50 border border-black/5"
                  )}
                >
                  {done ? "✓" : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={clsx(
                      "h-px flex-1",
                      done
                        ? "bg-gradient-to-r from-plum-500 to-rose-400"
                        : "bg-black/10"
                    )}
                  />
                )}
              </div>
              <span
                className={clsx(
                  "hidden sm:inline text-[10px] uppercase tracking-[0.18em]",
                  active ? "text-plum-700 font-bold" : "text-ink/55 font-medium"
                )}
              >
                {s.label}
              </span>
              <span
                className={clsx(
                  "sm:hidden text-[9px] uppercase tracking-wider",
                  active ? "text-plum-700 font-bold" : "text-ink/45 font-medium"
                )}
              >
                {active ? s.label : ""}
              </span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
