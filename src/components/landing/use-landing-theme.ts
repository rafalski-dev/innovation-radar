"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// Motyw dla ozdobnych komponentów z React Bits: null na serwerze (unika niezgodności przy hydracji).
export function useLandingTheme(): "light" | "dark" | null {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return resolvedTheme === "light" ? "light" : "dark";
}
