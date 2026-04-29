# Takaphotobooth — Premium In-Browser Photobooth

Aplikasi photobooth web modern berbasis **Next.js 14 (App Router) + TypeScript + Tailwind + Zustand**.
Dibangun dari PRD PhotoBooth dengan UI premium (terinspirasi dari photobooth-io.cc).

## ✨ Highlights
- 7 layout (3/4-pose strip, 6×4 grid, 9×9 grid, dll)
- 18 frame premium (Classic, Decorative, Themed)
- Live camera capture (`getUserMedia`) dengan countdown 3/5/10s, mirror, 7 filter (Original, Soft Glow, Warm, Cool, B&W, Vintage, Vivid)
- Live preview strip yang ter-update real-time saat memotret
- Full client-side rendering (canvas 300 DPI) — foto **tidak pernah** meninggalkan browser
- Download JPG & PNG print-ready
- Static export — bisa di-deploy ke Vercel / Netlify / Cloudflare Pages / hosting static apapun

## 🚀 Quick start

```bash
# pakai Node 18 atau 20
npm install
npm run dev
# buka http://localhost:3000
```

## 🏗 Build

```bash
npm run build
# Hasil static site ada di folder `out/`
# Upload langsung ke hosting static, atau:
npx serve out
```

## 📁 Struktur ringkas

```
src/
├── app/
│   ├── layout.tsx        # Root layout + fonts (Plus Jakarta Sans + Fraunces)
│   ├── page.tsx          # Landing
│   ├── layout/page.tsx   # Step 1: pilih layout
│   ├── size/page.tsx     # Step 2: pilih size
│   ├── camera/page.tsx   # Step 3: capture (live preview + filter + countdown)
│   ├── frame/page.tsx    # Step 4: pilih frame
│   └── result/page.tsx   # Step 5: download
├── components/
│   ├── FrameStrip.tsx    # Renderer DOM untuk preview strip + frame
│   ├── Header.tsx
│   ├── Stepper.tsx
│   ├── LandingPreview.tsx
│   └── HydrationGate.tsx
└── lib/
    ├── store.ts          # Zustand store (persist non-photo data)
    ├── layouts.ts        # 7 LayoutDef
    ├── frames.ts         # 18 FrameDef
    ├── sizes.ts          # 6 SizeDef
    ├── filters.ts        # 7 FilterDef
    ├── render.ts         # Canvas-based 300 DPI compositor
    └── types.ts
```

## 🎨 Design system
- Tipografi: **Fraunces** (display, italic light) + **Plus Jakarta Sans** (UI)
- Palet: cream `#FFF8F1`, ink `#1A1326`, rose 400-600, plum 500-700
- Radial-gradient soft (rose + plum) di background
- Cards: glassmorphism (`bg-white/70 backdrop-blur-xl`)
- Tombol primary: gradient rose→plum dengan inner highlight + outer glow

## 🔐 Privacy
Tidak ada upload, tidak ada login, tidak ada database. Semua processing
dilakukan di local canvas — foto tidak pernah keluar dari browser.

## 📝 Acceptance Criteria PRD
- [x] User dapat select layout (7 options)
- [x] User dapat select size (6 options)
- [x] User dapat take N photos sesuai layout
- [x] User dapat retry photo terakhir
- [x] User dapat select frame dari 18 options (3 kategori)
- [x] Preview hasil dengan frame applied
- [x] Download JPG & PNG (canvas 300 DPI)
- [x] Responsive mobile & desktop
- [x] Camera permission handling friendly
- [x] Smooth animations & transitions
- [x] Privacy-first (client-side only)
