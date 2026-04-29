import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { RouteFallback } from "@/components/RouteFallback";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Taka photobooth — Premium Photobooth in your browser",
  description:
    "A modern, in-browser photobooth. Pick a layout, snap your shots, choose a frame, and download a print-ready memory.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo-128.png", sizes: "128x128", type: "image/png" },
      { url: "/logo-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/logo-256.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-hero-grad font-sans text-ink antialiased">
        <div className="relative">
          <RouteFallback />
          {children}
        </div>
      </body>
    </html>
  );
}
