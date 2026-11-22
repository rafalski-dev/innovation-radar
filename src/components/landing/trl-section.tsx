import { TRL_BANDS, TRL_LABELS, type TrlBandKey } from "@/lib/trl";
import { cn } from "@/lib/utils";

// Sekcja „Czym są poziomy TRL?” na stronie głównej: pasek 9 poziomów i trzy grupy dojrzałości
// (badania, prototyp, wdrożenie) z opisem tego, co poziom oznacza dla użytkownika.
const BAND_INFO: Record<TrlBandKey, { meaning: string; forYou: string; tone: string }> = {
  research: {
    meaning: "Pomysł i dowód koncepcji. Technologia jest jeszcze w laboratorium.",
    forYou: "Dobry kandydat do współpracy z partnerem naukowym.",
    tone: "bg-brand/25",
  },
  prototype: {
    meaning: "Technologia jest testowana i pokazywana w warunkach zbliżonych do rzeczywistych.",
    forYou: "Do wspólnego rozwoju lub pilotażu we własnej firmie.",
    tone: "bg-brand/55",
  },
  deployment: {
    meaning: "Rozwiązanie działa w prawdziwych warunkach i jest sprawdzone w praktyce.",
    forYou: "Można je wdrożyć od razu albo po krótkich dostosowaniach.",
    tone: "bg-brand",
  },
};

const LEVELS = Array.from({ length: 9 }, (_, i) => i + 1);
const bandOf = (level: number) => TRL_BANDS.find((b) => level >= b.from && level <= b.to)!;

export function TrlSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-2" role="img" aria-label="Skala TRL od 1 do 9">
        <div className="grid grid-cols-9 gap-1.5">
          {LEVELS.map((level) => (
            <div
              key={level}
              className={cn(
                "flex h-12 items-end justify-center rounded-lg pb-1.5 text-xs font-medium tabular-nums",
                BAND_INFO[bandOf(level).key].tone,
                level >= 4 && level <= 6 ? "text-foreground" : level >= 7 ? "text-white" : "",
              )}
            >
              {level}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs text-muted-foreground">
          {TRL_BANDS.map((band) => (
            <span key={band.key}>
              {band.label} · TRL {band.from}–{band.to}
            </span>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-3">
        {TRL_BANDS.map((band) => {
          const info = BAND_INFO[band.key];
          return (
            <li key={band.key} className="flex flex-col gap-4 rounded-2xl border bg-card/60 p-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                  TRL {band.from}–{band.to}
                </p>
                <h3 className="text-lg font-medium tracking-tight">{band.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{info.meaning}</p>
              </div>
              <ol className="space-y-1.5 border-t pt-3 text-sm">
                {LEVELS.filter((l) => l >= band.from && l <= band.to).map((level) => (
                  <li key={level} className="flex gap-3">
                    <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                      TRL {level}
                    </span>
                    <span>{TRL_LABELS[level]}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-auto rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <span className="font-medium">Co to znaczy dla Ciebie: </span>
                {info.forYou}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Horyzont ocenia TRL każdego wyniku wyłącznie na podstawie informacji ze źródła. Gdy się nie
        da, liczymy wynik jako TRL 2 i zaznaczamy to w raporcie.
      </p>
    </div>
  );
}
