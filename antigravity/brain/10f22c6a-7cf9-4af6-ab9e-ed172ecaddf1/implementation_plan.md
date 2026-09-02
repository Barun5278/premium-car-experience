# AutoMind AI — Visual Design System Implementation Plan

## Design Direction & Philosophy
**AutoMind AI** embodies a **cinematic, minimal, luxurious, futuristic, and dark** automotive design aesthetic:
- **Restraint Over Excess**: Sharp typography, crisp alpha borders (`rgba(255,255,255,0.06)`), obsidian depth, and calculated neon accents rather than noisy gradients or aggressive blur effects.
- **Precision & Telemetry**: Technical eyebrows (`// 01 ARCHITECTURE`), geometric metric displays, and high-contrast status chips.
- **Tactile Micro-Interactions**: Fluid Framer Motion physics (spring-based tap reactions, subtle hover lifts, smooth state transitions).

---

## User Review Required

> [!IMPORTANT]
> The design system avoids bloated external UI libraries (like shadcn copy-pastes with unused Radix primitives) in favor of high-performance, lightweight, custom-crafted TypeScript + Tailwind + Framer Motion components tailored specifically for automotive visualization and telemetry.

---

## Proposed System Structure & Changes

### 1. Foundations & Tokens
- [MODIFY] [`frontend/lib/constants/theme.ts`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/lib/constants/theme.ts) — Refined color tokens: Obsidian `#06080C`, Carbon `#0B0F17`, Steel `#141B29`, Cyber Cyan `#00F0FF`, Champagne Gold `#D4AF37`, Hyper Crimson `#FF2A54`, Emerald `#10B981`, and border opacity scales.
- [NEW] [`frontend/lib/motion.ts`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/lib/motion.ts) — Reusable Framer Motion transitions, spring configurations, hover physics, stagger containers, and fade variants.
- [MODIFY] [`frontend/tailwind.config.ts`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/tailwind.config.ts) — Extended border-radius system (`xs: 4px`, `sm: 6px`, `md: 10px`, `lg: 14px`, `xl: 20px`), letter-spacing tokens, and subtle backdrop filters.
- [MODIFY] [`frontend/app/globals.css`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/app/globals.css) — Refined typography hierarchy, custom range sliders, micro-scrollbars, subtle carbon mesh pattern, and focus outlines.

### 2. Atomic Typography & Layout Primitives
- [NEW] [`frontend/components/ui/typography.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/typography.tsx) — `Heading` (H1-H4), `Text`, `Eyebrow` (cinematic technical label), and `Metric` (large telemetry stat with units).
- [NEW] [`frontend/components/ui/section.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/section.tsx) — `Section`, `SectionHeader`, and `Grid` container layout primitives.
- [MODIFY] [`frontend/components/ui/container.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/container.tsx) — Enhanced fluid container with spacing tokens.

### 3. Interactive Components with Micro-Interactions
- [MODIFY] [`frontend/components/ui/button.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/button.tsx) — Framer motion tactile tap/hover spring, variants (`primary`, `secondary`, `luxury`, `crimson`, `outline`, `ghost`, `glass`), icon alignment, loading spinners.
- [MODIFY] [`frontend/components/ui/card.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/card.tsx) — Obsidian cards, telemetry stat cards with live indicator, subtle border glow on hover, Framer Motion motion cards.
- [MODIFY] [`frontend/components/ui/badge.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/badge.tsx) — Status chips, live pulsating beacon badges, verified tags.
- [MODIFY] [`frontend/components/ui/input.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/input.tsx) — Text input with icon slots, clear button, shortcut badges (`⌘K`).
- [NEW] [`frontend/components/ui/select.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/select.tsx) — Precision dark dropdown select component.
- [NEW] [`frontend/components/ui/slider.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/slider.tsx) — Automotive dual/single range slider with value readout.
- [NEW] [`frontend/components/ui/switch.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/switch.tsx) — Tactile spring toggle switch with glow.

### 4. Feedback, Loading & Error States
- [NEW] [`frontend/components/ui/skeleton.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/skeleton.tsx) — Pulse shimmer skeletons for vehicle cards, spec tables, and metric blocks.
- [NEW] [`frontend/components/ui/spinner.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/spinner.tsx) — Automotive radar/hud loading indicator.
- [NEW] [`frontend/components/ui/alert.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/alert.tsx) — High-contrast alert banners (`info`, `success`, `warning`, `error`).
- [NEW] [`frontend/components/ui/empty-state.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/components/ui/empty-state.tsx) — Cinematic empty state with illustration placeholder and retry action button.

### 5. Design System Showcase
- [MODIFY] [`frontend/app/page.tsx`](file:///C:/Users/chauh/.gemini/antigravity/scratch/automind-ai/frontend/app/page.tsx) — Comprehensive visual kitchen sink / showcase demonstrating all 11 requirements interactively with working state.

---

## Verification Plan

### Automated Verification
- Run TypeScript typecheck: `npx tsc --noEmit` in `frontend/`
- Run Next.js production build: `npm run build` in `frontend/`
- Ensure 0 build warnings or TypeScript compilation errors

### Manual Verification
- Review micro-interactions (hover, focus, active states).
- Verify responsive layout across mobile and desktop breakpoints.
