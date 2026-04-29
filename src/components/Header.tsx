"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";

const NAV_LINKS = [
  { href: "/layout", label: "Layouts" },
  { href: "/frame", label: "Frames" },
  { href: "/#about", label: "About" },
] as const;

/**
 * Sticky top header with responsive navigation. Mobile (<md) gets a
 * hamburger that opens a slide-in drawer; tablet+ shows inline links.
 */
export function Header() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-5 sm:py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Taka photobooth — home"
        >
          <Image
            src="/logo-256.png"
            alt="Taka photobooth"
            width={220}
            height={165}
            priority
            className="h-12 w-auto sm:h-14 lg:h-16"
          />
          <span className="sr-only">Taka photobooth</span>
        </Link>

        {/* Desktop / tablet inline nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-sm text-ink/70 md:flex"
        >
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
          <Link
            href="/layout"
            className="rounded-full bg-ink px-4 py-2 font-medium text-cream transition hover:opacity-90"
          >
            Start a strip
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 text-ink transition hover:bg-ink/10 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        links={NAV_LINKS}
      />
    </header>
  );
}
