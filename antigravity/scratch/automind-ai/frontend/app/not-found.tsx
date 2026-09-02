import React from "react";
import NextLink from "next/link";
import { Container } from "@/components/ui/container";
import { Heading, Text, Eyebrow } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <Container size="md" className="text-center space-y-6">
        <Eyebrow accent="crimson">404 // TELEMETRY LOST</Eyebrow>
        
        <Heading level="h1" className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
          VEHICLE <span className="text-rose-400">NOT FOUND</span>
        </Heading>

        <Text variant="lead" className="text-slate-400 max-w-md mx-auto">
          The requested vehicle identifier is either decommissioned or not present in the current active fleet catalog.
        </Text>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <NextLink href="/explore">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Explore Fleet Catalog
            </Button>
          </NextLink>

          <NextLink href="/">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Return to Homepage
            </Button>
          </NextLink>
        </div>
      </Container>
    </div>
  );
}
