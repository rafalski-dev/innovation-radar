"use client";

import type { ReactNode } from "react";
import { useLandingTheme } from "@/components/landing/use-landing-theme";
import GradientText from "@/components/landing/react-bits/GradientText";
import ShinyText from "@/components/landing/react-bits/ShinyText";
import SpotlightCard from "@/components/landing/react-bits/SpotlightCard";
import { cn } from "@/lib/utils";

const BLUE = "#0085cc";
const GREEN = "#6bb437";

// Karta z efektem reflektora (React Bits), dopasowana do motywu i kolorów marki.
export function FeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useLandingTheme();
  if (!theme) return <div className={cn("rounded-3xl border p-8", className)}>{children}</div>;
  return (
    <SpotlightCard
      theme={theme}
      spotlightColor={BLUE}
      intensity={theme === "dark" ? 0.18 : 0.5}
      className={cn("p-6", className)}
    >
      {children}
    </SpotlightCard>
  );
}

// Delikatny gradient w kolorach logo (niebieski → zielony) na wybranych słowach nagłówka.
export function BrandGradientText({ children }: { children: ReactNode }) {
  const theme = useLandingTheme();
  if (!theme) return <span>{children}</span>;
  return (
    <GradientText
      colors={
        theme === "dark" ? [BLUE, "#7fc4ea", GREEN, BLUE] : ["#006eaa", BLUE, "#4f9a22", BLUE]
      }
      animationSpeed={10}
      scale={2}
    >
      {children}
    </GradientText>
  );
}

// Błysk przesuwający się po małym nagłówku sekcji.
export function ShinyLabel({ children }: { children: string }) {
  const theme = useLandingTheme();
  if (!theme) return <span>{children}</span>;
  return (
    <ShinyText
      text={children}
      color={theme === "dark" ? "#9a9aa3" : "#6b6b74"}
      shineColor={theme === "dark" ? "#ffffff" : "#18181b"}
      speed={3.5}
      delay={1}
    />
  );
}
