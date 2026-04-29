import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia"],
      },
      colors: {
        cream: "#FFF8F1",
        ink: "#1A1326",
        rose: {
          50: "#FFF1F4",
          100: "#FFE0E8",
          200: "#FFC2D2",
          300: "#FF9DB7",
          400: "#FF6F94",
          500: "#FF3D74",
          600: "#E11D5C",
        },
        plum: {
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
        },
      },
      boxShadow: {
        soft: "0 12px 40px -16px rgba(124, 58, 237, 0.25)",
        card: "0 24px 60px -28px rgba(124, 58, 237, 0.35)",
        glow: "0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 30px 80px -32px rgba(255, 61, 116, 0.45)",
      },
      backgroundImage: {
        "hero-grad":
          "radial-gradient(1200px 600px at 80% -10%, rgba(255, 192, 217, 0.55), transparent 60%), radial-gradient(900px 500px at 0% 110%, rgba(167, 139, 250, 0.45), transparent 55%), linear-gradient(180deg, #FFF8F1 0%, #FFEFEA 100%)",
        "panel-grad":
          "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.55) 100%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        pop: "pop 220ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
