/**
 * AutoMind AI — Visual Design System Palette & Tokens
 * Premium, cinematic, minimal, dark automotive theme.
 */

export const THEME_COLORS = {
  // Deep Backgrounds
  background: {
    base: "#06080C",       // Deepest obsidian viewport background
    surface: "#0B0F17",    // Primary card and container surface
    elevated: "#111723",   // Elevated cards, dropdowns, dialogs
    overlay: "rgba(6, 8, 12, 0.82)", // Backdrop blur overlay
  },

  // Structural Borders
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    default: "rgba(255, 255, 255, 0.10)",
    strong: "rgba(255, 255, 255, 0.18)",
    cyan: "rgba(0, 240, 255, 0.40)",
    crimson: "rgba(255, 42, 84, 0.40)",
    gold: "rgba(212, 175, 55, 0.40)",
  },

  // Automotive Accents
  accent: {
    cyan: {
      DEFAULT: "#00F0FF",
      muted: "#009DAA",
      subtle: "rgba(0, 240, 255, 0.08)",
      glow: "0 0 20px rgba(0, 240, 255, 0.28)",
    },
    crimson: {
      DEFAULT: "#FF2A54",
      muted: "#A81634",
      subtle: "rgba(255, 42, 84, 0.08)",
      glow: "0 0 20px rgba(255, 42, 84, 0.28)",
    },
    gold: {
      DEFAULT: "#D4AF37",
      muted: "#8C711C",
      subtle: "rgba(212, 175, 55, 0.08)",
      glow: "0 0 20px rgba(212, 175, 55, 0.25)",
    },
    emerald: {
      DEFAULT: "#10B981",
      muted: "#065F46",
      subtle: "rgba(16, 185, 129, 0.08)",
      glow: "0 0 20px rgba(16, 185, 129, 0.25)",
    },
    amber: {
      DEFAULT: "#F59E0B",
      muted: "#92400E",
      subtle: "rgba(245, 158, 11, 0.08)",
    },
  },

  // Typography Hierarchy
  text: {
    primary: "#F8FAFC",   // Crisp high-contrast headlines & values
    secondary: "#94A3B8", // Body copy and labels
    muted: "#64748B",     // Secondary metadata & captions
    disabled: "#334155",  // Inactive states
  },
} as const;

export const RADII = {
  none: "0px",
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  full: "9999px",
} as const;

export const SPACING_SYSTEM = {
  section: {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  },
  container: {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  },
} as const;
