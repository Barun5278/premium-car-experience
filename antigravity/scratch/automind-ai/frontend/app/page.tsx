"use client";

import React, { useState } from "react";
import {
  Container,
  Section,
  SectionHeader,
  Grid,
  Heading,
  Text,
  Eyebrow,
  Metric,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  MetricCard,
  Input,
  Select,
  Slider,
  Switch,
  Badge,
  LiveBadge,
  SpecTag,
  Skeleton,
  CarCardSkeleton,
  SpecGridSkeleton,
  Spinner,
  Alert,
  EmptyState,
} from "@/components/ui";
import {
  Sparkles,
  Layers,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Zap,
  Gauge,
  Cpu,
  Shield,
  Activity,
  ArrowRight,
} from "lucide-react";

import { HeroSection } from "@/components/home";

export default function HomePage() {
  // Interactive Component State
  const [sliderPrice, setSliderPrice] = useState(85000);
  const [sliderHp, setSliderHp] = useState(620);
  const [switchAwd, setSwitchAwd] = useState(true);
  const [switchTrackMode, setSwitchTrackMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectFuel, setSelectFuel] = useState("electric");
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <main className="pb-24">
      {/* 1. Cinematic Full-Screen Hero Section */}
      <HeroSection />

        {/* 2. Global Typography System */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="01 // TYPOGRAPHY"
              title="Cinematic & Telemetry Typography"
              description="High-contrast sans headings, clear body copy, and mono telemetry metrics for automotive data."
            />

            <div className="space-y-8 bg-[#090D15] p-6 sm:p-8 rounded-lg border border-white/[0.06]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-white/[0.06] pb-6">
                <div>
                  <Eyebrow accent="cyan">Heading H1</Eyebrow>
                  <Heading level="h1" className="text-3xl sm:text-4xl mt-2">
                    Porsche 911 GT3 RS
                  </Heading>
                </div>
                <Text variant="small">
                  Used for main vehicle hero titles, major metric headings, and screen entrypoints.
                </Text>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-white/[0.06] pb-6">
                <div>
                  <Eyebrow accent="gold">Heading H2 & H3</Eyebrow>
                  <Heading level="h2" className="text-2xl mt-2">
                    Aerodynamic Telemetry & Downforce
                  </Heading>
                  <Heading level="h3" className="text-lg mt-1 text-slate-300">
                    Dual-Motor All-Wheel Drive Powertrain
                  </Heading>
                </div>
                <Text variant="small">
                  Used for section headers, module titles, and comparison matrices.
                </Text>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <Metric
                  label="0-60 MPH"
                  value="2.9"
                  unit="sec"
                  change="-0.3s vs base"
                  changeType="positive"
                />
                <Metric
                  label="Peak Power"
                  value="718"
                  unit="hp"
                  change="Twin-Turbo V8"
                  changeType="neutral"
                />
                <Metric
                  label="Est. Valuation"
                  value="$142,800"
                  unit="USD"
                  change="+4.2% (Appreciating)"
                  changeType="positive"
                />
                <Metric
                  label="Drag Coefficient"
                  value="0.23"
                  unit="Cd"
                  change="Active Aero Wing"
                  changeType="neutral"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* 3. Color Tokens & Palette */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="02 // COLOR PALETTE"
              title="Color Tokens & Alpha Borders"
              description="Deep obsidian backgrounds with calculated laser-sharp telemetry accents and minimal glare."
            />

            <Grid cols={4} gap="md">
              <div className="space-y-2 p-4 rounded-md bg-[#06080C] border border-white/[0.12]">
                <div className="h-12 w-full rounded-sm bg-[#06080C] border border-white/[0.2]" />
                <p className="font-mono text-xs font-bold text-white">Obsidian Base</p>
                <p className="font-mono text-[11px] text-slate-500">#06080C</p>
              </div>

              <div className="space-y-2 p-4 rounded-md bg-[#0B0F17] border border-white/[0.08]">
                <div className="h-12 w-full rounded-sm bg-[#0B0F17]" />
                <p className="font-mono text-xs font-bold text-white">Carbon Surface</p>
                <p className="font-mono text-[11px] text-slate-500">#0B0F17</p>
              </div>

              <div className="space-y-2 p-4 rounded-md bg-[#090D15] border border-cyan-400/30">
                <div className="h-12 w-full rounded-sm bg-cyan-400 shadow-cyan-glow" />
                <p className="font-mono text-xs font-bold text-cyan-400">Cyber Cyan</p>
                <p className="font-mono text-[11px] text-slate-500">#00F0FF (Action / Live)</p>
              </div>

              <div className="space-y-2 p-4 rounded-md bg-[#090D15] border border-rose-500/30">
                <div className="h-12 w-full rounded-sm bg-rose-500 shadow-crimson-glow" />
                <p className="font-mono text-xs font-bold text-rose-400">Hyper Crimson</p>
                <p className="font-mono text-[11px] text-slate-500">#FF2A54 (Performance)</p>
              </div>
            </Grid>
          </Container>
        </Section>

        {/* 4. Interactive Buttons */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="03 // INTERACTION"
              title="Button Variants & Springs"
              description="Tactile Framer Motion springs with loading states, luxury finishes, and icon slots."
            />

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" leftIcon={<Zap className="h-4 w-4" />}>
                  Primary Action
                </Button>
                <Button variant="secondary" leftIcon={<Layers className="h-4 w-4" />}>
                  Secondary Matte
                </Button>
                <Button variant="luxury" leftIcon={<Sparkles className="h-4 w-4" />}>
                  Luxury Gold
                </Button>
                <Button variant="crimson" leftIcon={<Gauge className="h-4 w-4" />}>
                  Track Mode
                </Button>
                <Button variant="outline">
                  Ghost Outline
                </Button>
                <Button variant="glass">
                  Subtle Glass
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/[0.06]">
                <Button variant="primary" size="sm">
                  Small (32px)
                </Button>
                <Button variant="primary" size="md">
                  Medium (40px)
                </Button>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Large (48px)
                </Button>
                <Button
                  variant="secondary"
                  isLoading={isLoadingButton}
                  onClick={() => {
                    setIsLoadingButton(true);
                    setTimeout(() => setIsLoadingButton(false), 1500);
                  }}
                >
                  {isLoadingButton ? "Inference..." : "Simulate Loading"}
                </Button>
              </div>
            </div>
          </Container>
        </Section>

        {/* 5. Cards & Telemetry Visuals */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="04 // SURFACES"
              title="Cards, Telemetry & Elevation"
              description="Restrained obsidian surfaces with telemetry status bars, hover lifts, and modular footers."
            />

            <Grid cols={3} gap="md">
              {/* Telemetry Metric Card */}
              <MetricCard
                label="ML Valued Price"
                value="$118,450"
                unit="USD"
                statusColor="cyan"
                trend="XGBoost Confidence: 94.2%"
                icon={<Cpu className="h-4 w-4" />}
              />

              <MetricCard
                label="0-100 KM/H"
                value="3.1"
                unit="sec"
                statusColor="crimson"
                trend="Launch Control Activated"
                icon={<Gauge className="h-4 w-4" />}
              />

              <MetricCard
                label="Gemini Advisor"
                value="98.5%"
                unit="Match"
                statusColor="gold"
                trend="Optimal for High-Speed Cruising"
                icon={<Sparkles className="h-4 w-4" />}
              />
            </Grid>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Standard Surface Card */}
              <Card variant="surface" withMotion>
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Eyebrow accent="cyan">Spec Module</Eyebrow>
                    <SpecTag label="AWD" value="Torque Vectoring" />
                  </div>
                  <CardTitle>Powertrain Architecture</CardTitle>
                  <CardDescription>
                    Permanent magnet synchronous motors with 800V fast-charging battery architecture.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">Total System Voltage</span>
                    <span className="font-mono text-slate-200">800 Volts</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Peak Charging Rate</span>
                    <span className="font-mono text-cyan-400">320 kW DC</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-xs text-slate-500 font-mono">ID: PT-800V</span>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Details
                  </Button>
                </CardFooter>
              </Card>

              {/* Elevated Card */}
              <Card variant="elevated" withMotion>
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <Eyebrow accent="gold">AI Recommendation</Eyebrow>
                    <Badge variant="gold">Top Match</Badge>
                  </div>
                  <CardTitle>Autonomous Comfort & Range</CardTitle>
                  <CardDescription>
                    Synthesized from 450+ verified highway road tests and dynamic suspension logs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">EPA Estimated Range</span>
                    <span className="font-mono text-slate-200">385 Miles</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Adaptive Air Damper</span>
                    <span className="font-mono text-emerald-400">Active</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-xs text-slate-500 font-mono">CONF: 0.96</span>
                  <Button variant="luxury" size="sm">
                    Configure
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </Container>
        </Section>

        {/* 6. Form Inputs & Telemetry Controls */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="05 // CONTROLS"
              title="Inputs, Sliders & Precision Toggles"
              description="High-precision controls for filtering car inventory, setting ML parameters, and search."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-8 rounded-lg bg-[#080C14] border border-white/[0.06]">
              {/* Text / Search Input */}
              <div className="space-y-4">
                <Input
                  label="Vehicle Search"
                  placeholder="e.g. Porsche, M3, RS6..."
                  leftIcon={<Search className="h-4 w-4" />}
                  shortcutBadge="⌘K"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  helperText="Search across 12,000+ catalog entries"
                />

                <Select
                  label="Powertrain Filter"
                  value={selectFuel}
                  onChange={(e) => setSelectFuel(e.target.value)}
                  options={[
                    { value: "electric", label: "Pure Electric (BEV)" },
                    { value: "hybrid", label: "Plug-in Hybrid (PHEV)" },
                    { value: "gasoline", label: "Internal Combustion (ICE)" },
                  ]}
                />
              </div>

              {/* Sliders */}
              <div className="space-y-6">
                <Slider
                  label="Max Budget Target"
                  min={30000}
                  max={250000}
                  step={5000}
                  value={sliderPrice}
                  onChange={setSliderPrice}
                  formatValue={(val) => `$${val.toLocaleString()}`}
                />

                <Slider
                  label="Minimum Horsepower"
                  min={200}
                  max={1000}
                  step={20}
                  value={sliderHp}
                  onChange={setSliderHp}
                  unit="HP"
                />
              </div>

              {/* Switches & Toggles */}
              <div className="space-y-5 flex flex-col justify-center">
                <Switch
                  checked={switchAwd}
                  onCheckedChange={setSwitchAwd}
                  accent="cyan"
                  label="All-Wheel Drive (AWD)"
                  description="Prioritize dual-motor torque vectoring"
                />

                <Switch
                  checked={switchTrackMode}
                  onCheckedChange={setSwitchTrackMode}
                  accent="crimson"
                  label="Track Suspension Calibration"
                  description="Stiffen anti-roll bars and active aero"
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* 7. Badges & Tags */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="06 // BADGES & LABELS"
              title="Status Badges & Spec Tags"
              description="High-contrast technical chips and live beacon indicators."
            />

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="cyan">Gemini 2.5 Active</Badge>
                <Badge variant="crimson">Track Tuned</Badge>
                <Badge variant="gold">Certified Pre-Owned</Badge>
                <Badge variant="emerald">Clean Title</Badge>
                <Badge variant="slate">Archived</Badge>
                <Badge variant="outline">Telemetry Synced</Badge>
                <Badge variant="glass">Subtle Glass</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <LiveBadge color="cyan" label="FastAPI Connected" />
                <LiveBadge color="emerald" label="ML Model Ready" />
                <LiveBadge color="crimson" label="Thermal Alert" />
                <LiveBadge color="amber" label="Ingesting Telemetry" />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <SpecTag label="MAKE" value="Porsche" />
                <SpecTag label="BODY" value="Coupe" />
                <SpecTag label="0-60" value="2.9s" />
                <SpecTag label="DRIVE" value="AWD" />
                <SpecTag label="ENGINE" value="4.0L Boxer 6" />
              </div>
            </div>
          </Container>
        </Section>

        {/* 8. Loading & Skeleton States */}
        <Section spacing="md" withBorder>
          <Container size="xl">
            <SectionHeader
              eyebrow="07 // ASYNC STATES"
              title="Loading HUD & Skeleton Shimmers"
              description="Smooth, non-jarring placeholders for asynchronous 3D assets, ML inference, and inventory."
            />

            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-around gap-8 p-6 rounded-lg bg-[#090D15] border border-white/[0.06]">
                <Spinner size="sm" label="Connecting..." />
                <Spinner size="md" label="Analyzing Spec Matrix" />
                <Spinner size="lg" variant="gold" label="Calculating Valuation" />
                <Spinner size="xl" variant="crimson" label="Loading 3D Meshes" />
              </div>

              <div className="space-y-4">
                <Text variant="small" className="font-mono text-cyan-400 uppercase tracking-wider">
                  Vehicle Card Skeleton Placeholder
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* 9. Error & Empty States */}
        <Section spacing="md">
          <Container size="xl">
            <SectionHeader
              eyebrow="08 // RECOVERY & ALERTS"
              title="Alert Banners & Empty States"
              description="Actionable error notifications, system warnings, and recovery workflows."
            />

            <div className="space-y-6">
              {showAlert && (
                <Alert
                  variant="info"
                  title="Telemetry Stream Online"
                  onDismiss={() => setShowAlert(false)}
                  actionSlot={
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                      View Stream Log
                    </Button>
                  }
                >
                  Live WebSocket link established with FastAPI inference core at 60 updates/sec.
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert variant="warning" title="Depreciation Alert">
                  Model depreciation accelerated by 3.2% over last quarter.
                </Alert>
                <Alert variant="error" title="Inference Error">
                  Missing vehicle odometer data for VIN #9842.
                </Alert>
                <Alert variant="success" title="Valuation Verified">
                  Certified price aligned within 1.2% of market consensus.
                </Alert>
              </div>

              <div className="pt-4">
                <EmptyState
                  icon={<SlidersHorizontal className="h-6 w-6" />}
                  title="No Matching Vehicles Found"
                  description="We couldn't find any vehicles matching your current price ($85,000) and horsepower (620 HP) filters."
                  actionSlot={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSliderPrice(150000);
                        setSliderHp(500);
                      }}
                    >
                      Reset Filter Criteria
                    </Button>
                  }
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
  );
}
