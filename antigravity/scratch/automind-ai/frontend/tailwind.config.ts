import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#06080C",
          surface: "#0B0F17",
          elevated: "#111723",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
          DEFAULT: "rgba(255, 255, 255, 0.10)",
          strong: "rgba(255, 255, 255, 0.18)",
        },
        cyan: {
          DEFAULT: "#00F0FF",
          400: "#00F0FF",
          500: "#00d2e0",
          600: "#009DAA",
          glow: "rgba(0, 240, 255, 0.28)",
        },
        crimson: {
          DEFAULT: "#FF2A54",
          400: "#FF4D70",
          500: "#FF2A54",
          600: "#A81634",
          glow: "rgba(255, 42, 84, 0.28)",
        },
        gold: {
          DEFAULT: "#D4AF37",
          400: "#E5C158",
          500: "#D4AF37",
          600: "#8C711C",
          glow: "rgba(212, 175, 55, 0.25)",
        },
        emerald: {
          DEFAULT: "#10B981",
          400: "#34D399",
          500: "#10B981",
          600: "#065F46",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      letterSpacing: {
        widest: "0.22em",
        technical: "0.14em",
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(0, 240, 255, 0.25)",
        "cyan-glow-lg": "0 0 35px rgba(0, 240, 255, 0.35)",
        "crimson-glow": "0 0 20px rgba(255, 42, 84, 0.25)",
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.22)",
        "glass-elevated": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
        subtle: "12px",
        glass: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
