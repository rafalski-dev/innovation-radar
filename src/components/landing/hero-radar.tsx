"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Radar from "@/components/landing/radar";

// Radar w tle sekcji głównej (preset „horizon” z React Bits) w pomarańczowym odcieniu akcentu.
// W trybie jasnym ten sam radar jest rysowany ciemniejszym pomarańczem, żeby był widoczny na jasnym tle.
export function HeroRadar() {
  const { resolvedTheme } = useTheme();
  // false na serwerze, true w przeglądarce: unika niezgodności motywu przy hydracji
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return null;

  const light = resolvedTheme === "light";
  return (
    <div className="pointer-events-none absolute inset-0">
      <Radar
        color={light ? "#c2410c" : "#ff5b22"}
        lightMode={light}
        scale={1.7}
        tilt={64}
        centerY={0.92}
        speed={0.45}
        ringCount={3}
        clutter={0.1}
        gridOpacity={light ? 0.9 : 0.35}
        trail={0.23}
        spokeCount={6}
        glow={0.5}
        opacity={light ? 1 : 0.5}
        targets={7}
        brightness={light ? 1.5 : 0.95}
        mouseInteraction={false}
      />
    </div>
  );
}
