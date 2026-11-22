"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLandingTheme } from "@/components/landing/use-landing-theme";
import ShinyText from "@/components/landing/react-bits/ShinyText";
import SpotlightCard from "@/components/landing/react-bits/SpotlightCard";
import { cn } from "@/lib/utils";

const ORANGE = "#ff5b22";

// Karta z efektem reflektora (React Bits): ciemna powierzchnia, cienka ramka i pomarańczowy reflektor.
export function FeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  const theme = useLandingTheme();
  if (!theme) {
    return <div className={cn("rounded-3xl border bg-card p-6 sm:p-8", className)}>{children}</div>;
  }
  return (
    <SpotlightCard
      theme={theme}
      spotlightColor={ORANGE}
      intensity={theme === "dark" ? 0.16 : 0.4}
      className={cn("rounded-3xl p-6 sm:p-8", className)}
      style={
        {
          "--spotlight-card-surface": theme === "dark" ? "#0d0e11" : "#ffffff",
          "--spotlight-card-border":
            theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(24, 24, 27, 0.1)",
        } as CSSProperties
      }
    >
      {children}
    </SpotlightCard>
  );
}

// Błysk przesuwający się po tekście plakietki.
export function ShinyLabel({ children }: { children: string }) {
  const theme = useLandingTheme();
  if (!theme) return <span>{children}</span>;
  return (
    <ShinyText
      text={children}
      color={theme === "dark" ? "#b8b8c0" : "#6b6b74"}
      shineColor={theme === "dark" ? "#ffffff" : "#18181b"}
      speed={3.5}
      delay={1}
    />
  );
}
