import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout";

export const metadata: Metadata = {
  title: "AUTOMIND AI | Next-Gen Automotive Intelligence Platform",
  description:
    "AI-powered automotive intelligence platform featuring 3D vehicle visualization, machine learning valuation, intelligent car recommendations, and conversational vehicle research.",
  keywords: [
    "Automotive AI",
    "Car Intelligence",
    "Machine Learning Used Car Valuation",
    "3D Car Visualization",
    "Gemini Automotive Assistant",
  ],
  authors: [{ name: "AUTOMIND AI Team" }],
};

export const viewport: Viewport = {
  themeColor: "#06080c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="telemetry-grid antialiased selection:bg-cyan-400 selection:text-black min-h-screen bg-[#06080C] text-slate-100">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
