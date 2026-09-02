"use client";

import React from "react";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass, Gauge, Zap, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LiveBadge, SpecTag } from "@/components/ui/badge";
import { Eyebrow, Text } from "@/components/ui/typography";
import { SPRING_TRANSITION, GENTLE_SPRING } from "@/lib/motion";

export const HeroSection = () => {
  const scrollToExplore = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden pt-8 sm:pt-12 pb-12">
      {/* 1. Atmospheric Ambient Lighting & Flares */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top Center Cyan Cone Flare */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-500/18 via-cyan-500/05 to-transparent blur-3xl rounded-full" />
        
        {/* Ground Reflection Light Ellipse */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[900px] max-w-[95vw] h-[180px] bg-cyan-500/12 blur-3xl rounded-full" />
        
        {/* Subtle Ambient Pulse Light */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full"
        />
      </div>

      {/* 2. Top Content: Eyebrow, Headline, Subtitle, and CTAs */}
      <Container size="xl" className="relative z-10 text-center space-y-6 max-w-5xl mx-auto">
        {/* Entrance Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center gap-3"
        >
          <LiveBadge color="cyan" label="Next-Gen Automotive Platform" />
          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-600" />
          <span className="hidden sm:inline-block font-mono text-xs text-slate-400 uppercase tracking-widest">
            Gemini AI + XGBoost Engine
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none">
            THE FUTURE OF <br />
            <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.35)]">
              MOBILITY
            </span>
          </h1>
        </motion.div>

        {/* Supporting Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          AI-powered intelligence for the way you drive.
        </motion.p>

        {/* Dual Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <NextLink href="/explore" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto uppercase tracking-wider text-xs font-bold px-8 shadow-cyan-glow"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Explore Cars
            </Button>
          </NextLink>

          <NextLink href="/ai-finder" className="w-full sm:w-auto">
            <Button
              variant="glass"
              size="lg"
              className="w-full sm:w-auto uppercase tracking-wider text-xs font-semibold px-8 hover:border-cyan-400/40"
              leftIcon={<Sparkles className="h-4 w-4 text-cyan-400" />}
            >
              AI Car Finder
            </Button>
          </NextLink>
        </motion.div>
      </Container>

      {/* 3. Central Vehicle Visual with Floating Animation & Telemetry Overlays */}
      <Container size="xl" className="relative z-10 my-4 sm:my-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Subtle Breathing / Floating Vehicle Container */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Cinematic Automotive Silhouette Visual */}
            <div className="relative w-full max-w-4xl h-[220px] sm:h-[320px] md:h-[400px] flex items-center justify-center">
              {/* High-Precision Automotive Vector & Glow Silhouette */}
              <svg
                viewBox="0 0 1000 400"
                className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Chassis Paint Gradient */}
                  <linearGradient id="chassisGrad" x1="100" y1="200" x2="900" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0B101D" />
                    <stop offset="25%" stopColor="#162238" />
                    <stop offset="50%" stopColor="#253858" />
                    <stop offset="75%" stopColor="#162238" />
                    <stop offset="100%" stopColor="#0B101D" />
                  </linearGradient>

                  {/* Cockpit Canopy Glass Gradient */}
                  <linearGradient id="canopyGrad" x1="400" y1="120" x2="650" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
                    <stop offset="40%" stopColor="#08101E" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#020408" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Laser Headlight Glow Filter */}
                  <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Taillight Crimson Glow */}
                  <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ground Shadow Plate */}
                <ellipse cx="500" cy="360" rx="420" ry="24" fill="#000000" fillOpacity="0.85" filter="blur(16px)" />
                <ellipse cx="500" cy="355" rx="380" ry="12" fill="#00F0FF" fillOpacity="0.18" filter="blur(12px)" />

                {/* Main Aerodynamic Hypercar Body Contour */}
                <path
                  d="M120 310 C 140 280, 200 270, 260 265 C 340 260, 410 200, 480 150 C 530 115, 660 110, 720 150 C 780 190, 830 240, 880 270 C 910 285, 930 295, 910 320 C 880 335, 780 340, 500 340 C 220 340, 140 335, 120 310 Z"
                  fill="url(#chassisGrad)"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="2"
                />

                {/* Cockpit Canopy Glass */}
                <path
                  d="M440 180 C 470 140, 540 125, 620 130 C 680 135, 710 160, 740 200 C 680 205, 530 205, 440 180 Z"
                  fill="url(#canopyGrad)"
                  stroke="#00F0FF"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                />

                {/* Aerodynamic Shoulder & Character Crease */}
                <path
                  d="M160 285 C 280 270, 450 245, 620 245 C 750 245, 840 270, 890 290"
                  stroke="rgba(0, 240, 255, 0.45)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Front Splitter / Air Intake */}
                <path
                  d="M840 300 L 915 320 L 890 335 L 820 335 Z"
                  fill="#060910"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />

                {/* Rear Diffuser & Aero Wing */}
                <path
                  d="M100 270 L 150 260 L 140 275 L 90 285 Z"
                  fill="#060910"
                  stroke="rgba(255, 42, 84, 0.6)"
                  strokeWidth="1.5"
                  filter="url(#crimsonGlow)"
                />

                {/* Front Wheel & Carbon Rim */}
                <g transform="translate(750, 315)">
                  <circle cx="0" cy="0" r="48" fill="#06080C" stroke="#1F293D" strokeWidth="6" />
                  <circle cx="0" cy="0" r="38" fill="#0B0F17" stroke="#00F0FF" strokeOpacity="0.4" strokeWidth="2" />
                  <circle cx="0" cy="0" r="14" fill="#141E30" stroke="#00F0FF" strokeWidth="2" />
                  {/* Rotor Spokes */}
                  <line x1="-30" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="0" y1="-30" x2="0" y2="30" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="-21" y1="-21" x2="21" y2="21" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="21" y1="-21" x2="-21" y2="21" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                </g>

                {/* Rear Wheel & Carbon Rim */}
                <g transform="translate(250, 315)">
                  <circle cx="0" cy="0" r="48" fill="#06080C" stroke="#1F293D" strokeWidth="6" />
                  <circle cx="0" cy="0" r="38" fill="#0B0F17" stroke="#00F0FF" strokeOpacity="0.4" strokeWidth="2" />
                  <circle cx="0" cy="0" r="14" fill="#141E30" stroke="#00F0FF" strokeWidth="2" />
                  {/* Rotor Spokes */}
                  <line x1="-30" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="0" y1="-30" x2="0" y2="30" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="-21" y1="-21" x2="21" y2="21" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="21" y1="-21" x2="-21" y2="21" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                </g>

                {/* Laser Matrix Headlight (Cyan Glow) */}
                <path
                  d="M875 282 L 910 295 L 890 300 Z"
                  fill="#00F0FF"
                  filter="url(#cyanGlow)"
                />
                <circle cx="895" cy="290" r="4" fill="#FFFFFF" filter="url(#cyanGlow)" />

                {/* OLED Tail Lamp Signature (Crimson Glow) */}
                <path
                  d="M125 290 L 155 285 L 145 295 Z"
                  fill="#FF2A54"
                  filter="url(#crimsonGlow)"
                />
                <line x1="120" y1="292" x2="160" y2="288" stroke="#FF2A54" strokeWidth="3" filter="url(#crimsonGlow)" />
              </svg>
            </div>
          </motion.div>

          {/* Floating Left Telemetry Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden md:flex absolute top-12 left-4 items-center gap-3 rounded-md bg-[#090D16]/85 backdrop-blur-md border border-white/[0.08] p-3.5 shadow-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Zap className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                0-60 MPH ACCELERATION
              </p>
              <p className="font-mono text-base font-extrabold text-white">
                2.8 <span className="text-xs text-cyan-400 font-normal">sec (Launch Control)</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Right Telemetry Badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="hidden md:flex absolute top-12 right-4 items-center gap-3 rounded-md bg-[#090D16]/85 backdrop-blur-md border border-white/[0.08] p-3.5 shadow-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Gauge className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                PEAK POWERTRAIN
              </p>
              <p className="font-mono text-base font-extrabold text-white">
                750 <span className="text-xs text-rose-400 font-normal">HP • Dual-Motor AWD</span>
              </p>
            </div>
          </motion.div>

          {/* Bottom Telemetry Spec Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-4"
          >
            <SpecTag label="DRIVE" value="Active Torque Vectoring" />
            <SpecTag label="SYSTEM" value="800V Architecture" />
            <SpecTag label="RANGE" value="380 mi EPA" />
            <SpecTag label="AI CONFIDENCE" value="98.4%" />
          </motion.div>
        </motion.div>
      </Container>

      {/* 4. Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.95 }}
        onClick={scrollToExplore}
        className="relative z-10 flex flex-col items-center justify-center gap-2 cursor-pointer pt-4 group"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">
          Scroll to explore platform
        </span>
        <div className="flex h-7 w-4 items-start justify-center rounded-full border border-white/20 p-1 group-hover:border-cyan-400/50 transition-colors">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]"
          />
        </div>
      </motion.div>
    </section>
  );
};
