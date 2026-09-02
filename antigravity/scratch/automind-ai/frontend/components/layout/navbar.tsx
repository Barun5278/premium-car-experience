"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/navigation"; // Note: next/link in Next.js
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ArrowRight, Compass, Shield, Cpu, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAVIGATION, NAVBAR_CTA } from "@/lib/constants/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { SPRING_TRANSITION, GENTLE_SPRING } from "@/lib/motion";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection to adapt navbar background elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-[#06080C]/90 backdrop-blur-md border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-[#06080C]/75 backdrop-blur-sm border-b border-white/[0.05]"
      )}
    >
      <Container size="xl">
        <nav
          aria-label="Main Navigation"
          className="flex h-16 sm:h-20 items-center justify-between"
        >
          {/* Brand Logo */}
          <NextLink
            href="/"
            className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
            aria-label="AutoMind AI Homepage"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-400/30 text-cyan-400 font-mono font-black text-sm tracking-tighter group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300">
              AM
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white uppercase leading-none">
                AUTO<span className="text-cyan-400 transition-colors group-hover:text-cyan-300">MIND</span> AI
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 leading-tight pt-0.5">
                Automotive Intelligence
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {MAIN_NAVIGATION.map((item, index) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredIndex === index;

              return (
                <NextLink
                  key={item.title}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {/* Subtle Background Hover Indicator */}
                  <AnimatePresence>
                    {isHovered && !isActive && (
                      <motion.div
                        layoutId="navbar-hover"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={GENTLE_SPRING}
                        className="absolute inset-0 rounded-md bg-white/[0.04] border border-white/[0.06] -z-10"
                      />
                    )}
                  </AnimatePresence>

                  {/* Active Link Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      transition={SPRING_TRANSITION}
                      className="absolute inset-0 rounded-md bg-[#0F1624] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.15)] -z-10"
                    />
                  )}

                  <span className="flex items-center gap-2">
                    {item.isAi && (
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    )}
                    {item.title}
                    {item.badge && (
                      <span className="inline-flex items-center rounded-xs bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {/* Active Bottom Glow Line */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-2 right-2 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </NextLink>
              );
            })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LiveBadge color="cyan" label="FastAPI Core" className="hidden xl:inline-flex" />
            <NextLink href={NAVBAR_CTA.href} tabIndex={-1}>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="font-semibold text-xs tracking-wider uppercase px-5"
              >
                {NAVBAR_CTA.title}
              </Button>
            </NextLink>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-slate-900/80 border border-white/[0.10] text-slate-300 hover:text-white hover:border-cyan-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu Overlay & Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 sm:top-20 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Mobile Drawer */}
            <motion.div
              id="mobile-navigation"
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={SPRING_TRANSITION}
              className="fixed inset-x-0 top-16 sm:top-20 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-white/[0.10] bg-[#080C14] px-4 py-6 shadow-2xl lg:hidden"
            >
              <div className="flex flex-col space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-1">
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                    Navigation Menu
                  </span>
                  <LiveBadge color="cyan" label="Online" />
                </div>

                {MAIN_NAVIGATION.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <NextLink
                      key={item.title}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-start justify-between p-3.5 rounded-md border transition-all duration-200",
                        isActive
                          ? "bg-[#0F1625] border-cyan-400/40 text-white shadow-[0_0_15px_rgba(0,240,255,0.12)]"
                          : "bg-slate-900/50 border-white/[0.06] text-slate-300 hover:bg-slate-800/80 hover:border-white/[0.15] hover:text-white"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.isAi && (
                            <Sparkles className="h-4 w-4 text-cyan-400" />
                          )}
                          <span className="font-semibold text-sm tracking-wide">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="rounded-xs bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase text-cyan-300 border border-cyan-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 leading-relaxed font-normal pr-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className={cn(
                          "h-4 w-4 mt-1 flex-shrink-0 transition-transform duration-200",
                          isActive
                            ? "text-cyan-400 translate-x-1"
                            : "text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1"
                        )}
                      />
                    </NextLink>
                  );
                })}

                {/* Mobile Menu Footer CTA */}
                <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-3">
                  <NextLink
                    href={NAVBAR_CTA.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold uppercase tracking-wider text-sm shadow-cyan-glow"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {NAVBAR_CTA.title}
                    </Button>
                  </NextLink>

                  <div className="flex items-center justify-between text-center pt-2 px-2 text-[11px] font-mono text-slate-400">
                    <span>FastAPI Core: :8000</span>
                    <span>Gemini 2.5 Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
