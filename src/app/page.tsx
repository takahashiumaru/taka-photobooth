import Link from "next/link";
import { Header } from "@/components/Header";
import { LAYOUTS } from "@/lib/layouts";
import { FRAMES } from "@/lib/frames";
import { LandingPreview } from "@/components/LandingPreview";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-6">
        {/* Hero */}
        <section className="relative grid items-center gap-10 py-10 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-16">
          <div>
            <span className="eyebrow">In-browser photobooth · v1.0</span>
            <h1 className="display-h1 mt-4">
              Capture moments,{" "}
              <span className="bg-gradient-to-r from-rose-500 to-plum-600 bg-clip-text text-transparent">
                printed in pixels.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink/65 md:text-lg">
              Pick a layout, snap your shots, dress it up with one of 18 hand-crafted frames,
              and download a print-ready strip — all without leaving your browser.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/layout" className="btn-primary">
                Start a strip
                <ArrowRight />
              </Link>
              <a href="#layouts" className="btn-ghost">
                Explore layouts
              </a>
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-3 text-sm text-ink/65">
              <li className="flex flex-col">
                <span className="font-display text-2xl text-ink">7</span>
                Layouts
              </li>
              <li className="flex flex-col">
                <span className="font-display text-2xl text-ink">18</span>
                Premium frames
              </li>
              <li className="flex flex-col">
                <span className="font-display text-2xl text-ink">100%</span>
                On-device
              </li>
            </ul>
          </div>

          {/* Preview tower */}
          <LandingPreview />
        </section>

        {/* Layouts band */}
        <section id="layouts" className="py-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">Step one</span>
              <h2 className="display-h2 mt-2">Choose your layout</h2>
            </div>
            <Link
              href="/layout"
              className="text-sm font-medium text-plum-700 underline-offset-4 hover:underline"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {LAYOUTS.slice(0, 4).map((l) => (
              <Link
                key={l.id}
                href={`/layout?pick=${l.id}`}
                className="group relative flex flex-col gap-3 rounded-3xl bg-white/70 p-4 backdrop-blur-xl shadow-card transition hover:-translate-y-1"
              >
                <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-gradient-to-br from-white to-rose-50">
                  <div
                    className="bg-white shadow-soft"
                    style={{
                      width: "55%",
                      aspectRatio: `${l.inchW}/${l.inchH}`,
                      borderRadius: 6,
                      backgroundImage:
                        "linear-gradient(180deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px)",
                      backgroundSize: `100% ${100 / l.rows}%, ${100 / l.cols}% 100%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg italic">{l.name}</p>
                    <p className="text-xs text-ink/55">
                      {l.poses} pose · {l.inchW}×{l.inchH}
                    </p>
                  </div>
                  {l.badge && <Badge text={l.badge} />}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Frame band */}
        <section className="py-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">Step four</span>
              <h2 className="display-h2 mt-2">Frame it. Make it yours.</h2>
            </div>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {FRAMES.slice(0, 12).map((f) => (
              <div
                key={f.id}
                className="shrink-0 rounded-2xl bg-white/70 p-3 backdrop-blur-xl shadow-soft"
              >
                <div
                  className="h-20 w-32 rounded-xl"
                  style={{ background: f.swatch }}
                />
                <p className="mt-2 text-xs font-medium text-ink/70">{f.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About / footer cta */}
        <section
          id="about"
          className="mt-12 overflow-hidden rounded-[36px] bg-gradient-to-br from-ink to-plum-700 p-10 text-cream shadow-card md:p-14"
        >
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-rose-200">
                Privacy first
              </span>
              <h3 className="display-h2 mt-2 text-cream">
                Everything happens on your device.
              </h3>
              <p className="mt-3 text-cream/70">
                No upload, no account, no tracking. Your photos never leave your browser —
                strip composition runs entirely on a local canvas.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                href="/layout"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 font-semibold text-ink hover:bg-white"
              >
                Take my first strip
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="pb-10 pt-6 text-center text-xs text-ink/45">
        Crafted with <span className="text-rose-500">♡</span> · Takaphotobooth
      </footer>
    </>
  );
}

function Badge({ text }: { text: string }) {
  const map: Record<string, string> = {
    NEW: "bg-rose-500 text-white",
    POPULAR: "bg-amber-300 text-amber-900",
    "TRY IT": "bg-plum-600 text-white",
  };
  return (
    <span className={`chip ${map[text] ?? "bg-black text-white"}`}>{text}</span>
  );
}

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
