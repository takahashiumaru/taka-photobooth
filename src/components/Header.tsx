"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-5 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-plum-600 text-white shadow-soft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="6"
                width="18"
                height="13"
                rx="2.5"
                stroke="white"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12.5" r="3.4" stroke="white" strokeWidth="1.6" />
              <rect x="8" y="3.5" width="8" height="3.5" rx="1.2" fill="white" />
            </svg>
          </div>
          <span className="font-display text-2xl italic font-light tracking-tight">
            Takaphotobooth
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <Link href="/layout" className="hover:text-ink">
            Layouts
          </Link>
          <Link href="/frame" className="hover:text-ink">
            Frames
          </Link>
          <a
            href="#about"
            className="hover:text-ink"
          >
            About
          </a>
          <Link
            href="/layout"
            className="rounded-full bg-ink px-4 py-2 font-medium text-cream hover:opacity-90"
          >
            Start a strip
          </Link>
        </nav>

        {/* Mobile CTA */}
        <Link
          href="/layout"
          className="md:hidden rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream"
        >
          Start
        </Link>
      </div>
    </header>
  );
}
