import { ChevronDownIcon } from "lucide-react";
import { TRL_BANDS, TRL_LABELS } from "@/lib/trl";

// Rozwijany opis skali TRL (1–9) w opisie platformy.
export function TrlDetails() {
  return (
    <details className="group max-w-2xl rounded-2xl border bg-card/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        Czym są poziomy TRL?
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t px-4 py-4 text-sm">
        <p className="text-muted-foreground">
          TRL (Technology Readiness Level) to dziewięciostopniowa skala gotowości technologicznej:
          od pierwszej obserwacji zjawiska po rozwiązanie sprawdzone w codziennej eksploatacji.
          Radar ocenia w niej każdy wynik, więc od razu widać, co można wdrożyć, a co dopiero
          rozwijać z partnerem naukowym.
        </p>
        {TRL_BANDS.map((band) => (
          <div key={band.key} className="space-y-1.5">
            <p className="text-xs font-semibold tracking-widest text-brand uppercase">
              {band.label} · TRL {band.from}–{band.to}
            </p>
            <ol className="space-y-1">
              {Object.entries(TRL_LABELS)
                .filter(([level]) => Number(level) >= band.from && Number(level) <= band.to)
                .map(([level, label]) => (
                  <li key={level} className="flex gap-3">
                    <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                      TRL {level}
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
            </ol>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Gdy agent nie potrafi ocenić poziomu ze źródła, liczymy wynik jako TRL 2 i zaznaczamy to w
          raporcie.
        </p>
      </div>
    </details>
  );
}
