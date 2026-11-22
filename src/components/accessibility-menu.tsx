"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ContrastIcon, EyeIcon, PersonStandingIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

// Tryby dostępności zapisane jako klasy na <html> (cb, hc) i w localStorage. Skrypt w layout nakłada je
// przed pierwszym malowaniem, a style trybów są w globals.css.
const MODES = [
  {
    key: "cb",
    label: "Tryb dla daltonistów",
    hint: "Paleta bezpieczna przy zaburzeniach widzenia barw (niebieski i pomarańczowy zamiast czerwieni i zieleni).",
    icon: EyeIcon,
  },
  {
    key: "hc",
    label: "Tryb WCAG (wysoki kontrast)",
    hint: "Kontrast tekstu co najmniej 7:1, podkreślone linki, wyraźny fokus i brak animacji.",
    icon: ContrastIcon,
  },
] as const;

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useMode(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains(key),
    () => false,
  );
}

function toggleMode(key: string, enabled: boolean) {
  document.documentElement.classList.toggle(key, enabled);
  try {
    localStorage.setItem(`a11y-${key}`, enabled ? "1" : "0");
  } catch {
    // brak localStorage (tryb prywatny): tryb działa do odświeżenia strony
  }
}

function ModeSwitch({ mode }: { mode: (typeof MODES)[number] }) {
  const enabled = useMode(mode.key);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => toggleMode(mode.key, !enabled)}
      className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted"
    >
      <mode.icon className="mt-0.5 size-4 shrink-0 text-brand" />
      <span className="grid flex-1 gap-0.5">
        <span className="text-sm font-medium">{mode.label}</span>
        <span className="text-xs text-muted-foreground">{mode.hint}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition-colors",
          enabled ? "border-brand bg-brand" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "size-3.5 rounded-full bg-foreground transition-transform",
            enabled ? "translate-x-4 bg-white" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

// `inline`: sam przełączniki (do menu hamburger); domyślnie przycisk z rozwijanym panelem w nagłówku.
export function AccessibilityMenu({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switches = (
    <div className="grid gap-1">
      {MODES.map((mode) => (
        <ModeSwitch key={mode.key} mode={mode} />
      ))}
    </div>
  );
  if (inline) return switches;

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <PersonStandingIcon />
        <span className="sr-only">Ułatwienia dostępu</span>
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-popover p-2 text-popover-foreground shadow-lg">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">
            Ułatwienia dostępu
          </p>
          {switches}
        </div>
      )}
    </div>
  );
}
