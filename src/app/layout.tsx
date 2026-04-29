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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://taka-photobooth.vercel.app"
  ),
  title: {
    default: "Taka Photobooth | Premium Online Browser Photobooth",
    template: "%s | Taka Photobooth",
  },
  description:
    "Experience a modern, aesthetic in-browser photobooth. Pick a layout, snap your shots, apply beautiful frames, and download print-ready high-quality photo strips instantly without installing anything.",
  keywords: [
    "photobooth",
    "online photobooth",
    "browser photobooth",
    "photo strip",
    "virtual photobooth",
    "webcam photobooth",
    "photo frame",
    "instant photo",
    "photo booth app",
  ],
  authors: [{ name: "Taka" }],
  creator: "Taka",
  publisher: "Taka Photobooth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Taka Photobooth — Premium Online Photobooth",
    description:
      "A modern, in-browser photobooth. Snap your shots, choose beautiful frames, and download print-ready memories instantly.",
    url: "https://taka-photobooth.vercel.app",
    siteName: "Taka Photobooth",
    images: [
      {
        url: "/logo-256.png", // Replace with a real OG image if available
        width: 800,
        height: 600,
        alt: "Taka Photobooth Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taka Photobooth — Premium Online Photobooth",
    description:
      "A modern, in-browser photobooth. Snap your shots, choose beautiful frames, and download print-ready memories instantly.",
    images: ["/logo-256.png"], // Replace with a real OG image if available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
