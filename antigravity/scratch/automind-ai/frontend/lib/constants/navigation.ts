export interface NavItem {
  title: string;
  href: string;
  description?: string;
  badge?: string;
  isAi?: boolean;
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    title: "Explore",
    href: "/explore",
    description: "Photorealistic 3D vehicle catalog and technical telemetry",
  },
  {
    title: "AI Finder",
    href: "/ai-finder",
    description: "Multimodal intelligent recommendation tailored to your lifestyle",
    badge: "Smart Match",
    isAi: true,
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Side-by-side technical specs, performance, and value analysis",
  },
  {
    title: "Price Predictor",
    href: "/price-predictor",
    description: "XGBoost machine learning vehicle valuation engine",
    badge: "ML",
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    description: "Conversational automotive advisor powered by Gemini AI",
    badge: "Gemini",
    isAi: true,
  },
];

export const NAVBAR_CTA = {
  title: "Find My Car",
  href: "/ai-finder",
};
