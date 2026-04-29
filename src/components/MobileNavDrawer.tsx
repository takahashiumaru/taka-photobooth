"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NavLink = { href: string; label: string };

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  links: ReadonlyArray<NavLink>;
}

/**
 * Slide-in drawer used by the responsive header on screens smaller than the
 * `md` breakpoint. Rendered through a React portal directly into
 * `document.body` so it can never be trapped by a parent's stacking context
 * or `overflow` clip. Locks body scroll while open and closes on backdrop
 * tap, route navigation, or Escape key.
 */
export function MobileNavDrawer({
  open,
  onClose,
  links,
}: MobileNavDrawerProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  // Only mount portal on the client.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const overlay = (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <button
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 h-full w-full bg-ink/55 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={`absolute right-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 pb-4 pt-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
            aria-label="Taka photobooth — home"
          >
            <Image
              src="/logo-256.png"
              alt="Taka photobooth"
              width={180}
              height={135}
              className="h-12 w-auto"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 text-ink transition hover:bg-ink/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="rounded-2xl px-4 py-3 text-base font-medium text-ink transition hover:bg-ink/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-black/5 p-5">
          <Link
            href="/layout"
            onClick={onClose}
            className="block w-full rounded-full bg-gradient-to-r from-rose-500 to-plum-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
          >
            Start a strip
          </Link>
          <p className="mt-3 text-center text-[11px] text-ink/45">
            Crafted with <span className="text-rose-500">♡</span> · Taka
            photobooth
          </p>
        </div>
      </aside>
    </div>
  );

  return createPortal(overlay, document.body);
}
