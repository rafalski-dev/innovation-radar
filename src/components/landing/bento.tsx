import {
  BookOpenIcon,
  CheckIcon,
  EuroIcon,
  FileSearchIcon,
  FileTextIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LandmarkIcon,
  MapIcon,
  PlusIcon,
  RadarIcon,
  ScaleIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { FeatureCard } from "@/components/landing/themed-react-bits";
import { cn } from "@/lib/utils";

// „Bento”: duże karty z ilustracją u góry i opisem pod spodem (kolejność i układ jak w Veyro).
const chip = "rounded-full border px-2.5 py-1 text-[11px]";

function CardText({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Visual({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn("flex min-h-52 items-center justify-center", className)}>
      {children}
    </div>
  );
}

export function Bento() {
  const sourceIcons = [
    LandmarkIcon,
    FlaskConicalIcon,
    EuroIcon,
    GlobeIcon,
    RadarIcon,
    ScaleIcon,
    BookOpenIcon,
    FileSearchIcon,
    MapIcon,
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FeatureCard className="space-y-4">
        <Visual className="flex-col gap-4">
          <p className="text-xs text-muted-foreground">Gotowość technologiczna (TRL)</p>
          <div className="flex w-full max-w-xs items-end gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div key={n} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-full rounded-md",
                    n === 7 ? "bg-brand" : n < 7 ? "bg-brand/25" : "bg-muted-foreground/15",
                  )}
                  style={{ height: `${n * 9 + 12}px` }}
                />
                <span
                  className={cn("text-[10px]", n === 7 ? "text-brand" : "text-muted-foreground")}
                >
                  {n}
                </span>
              </div>
            ))}
          </div>
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">
            TRL 7/9: demonstrator w warunkach rzeczywistych
          </span>
        </Visual>
        <CardText
          title="Ocena gotowości (TRL)"
          text="Przy każdym wyniku skala gotowości technologicznej 1–9, oceniana wyłącznie na podstawie opisu w źródle. Gdy się nie da, piszemy „brak oceny”."
        />
      </FeatureCard>

      <FeatureCard className="space-y-4">
        <Visual className="flex-col items-start gap-3">
          <p className="text-xs text-muted-foreground">Frazy do wyszukiwarki</p>
          <div className="flex flex-wrap gap-2">
            {[
              "recykling baterii litowo-jonowych",
              "odzysk litu i kobaltu",
              "demontaż pakietów bateryjnych",
            ].map((p) => (
              <span key={p} className={chip}>
                {p}
              </span>
            ))}
            <span className={cn(chip, "border-brand/40 bg-brand/10 text-brand")}>
              <SparklesIcon className="mr-1 inline size-3" />
              kolejna fraza ze wskazówką
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[11px] font-medium text-white">
            <CheckIcon className="size-3" />
            Zatwierdź frazy
          </span>
        </Visual>
        <CardText
          title="Frazy pod kontrolą"
          text="AI proponuje frazy na podstawie opisu projektu. Poprawiasz je, dopisujesz kolejne z własną wskazówką i zatwierdzasz, zanim agent zacznie szukać."
        />
      </FeatureCard>

      <FeatureCard className="space-y-4">
        <Visual>
          <div className="grid grid-cols-3 gap-3">
            {sourceIcons.map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl border",
                  i === 4
                    ? "border-brand bg-brand text-white shadow-lg shadow-brand/30"
                    : "bg-background/60",
                )}
              >
                <Icon className="size-6" />
              </span>
            ))}
          </div>
        </Visual>
        <CardText
          title="Źródła do wyboru"
          text="Do każdego aspektu zaznaczasz do dwóch źródeł i liczbę wyników. Agent szuka tylko tam, gdzie mu pozwolisz, a nowe źródła dodaje administrator."
        />
      </FeatureCard>

      <FeatureCard className="space-y-4">
        <Visual className="relative">
          <div className="absolute size-52 rounded-full border border-dashed border-brand/30" />
          <div className="absolute size-72 rounded-full border border-brand/15" />
          <span className="relative flex size-20 items-center justify-center rounded-3xl bg-brand text-white shadow-xl shadow-brand/30">
            <FileTextIcon className="size-9" />
          </span>
          <div className="absolute bottom-0 flex flex-wrap justify-center gap-2">
            <span className={cn(chip, "bg-card")}>Pobierz PDF</span>
            <span className={cn(chip, "bg-card")}>
              <UsersIcon className="mr-1 inline size-3" />
              Wyślij zespołowi
            </span>
          </div>
        </Visual>
        <CardText
          title="Raport i praca zespołowa"
          text="Zbiorcze opracowanie projektu do zapisania jako PDF. Po wysłaniu go członkom organizacji projekt zostaje zamknięty do edycji."
        />
      </FeatureCard>

      <FeatureCard className="space-y-4 md:col-span-2">
        <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
          <div aria-hidden className="space-y-3">
            <div className="ml-auto w-fit max-w-full rounded-2xl border bg-background/60 px-4 py-2.5 text-sm">
              Które z wyników pasują do mojego projektu?
            </div>
            <div className="space-y-2.5 rounded-2xl border bg-background/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <RadarIcon className="size-3.5 text-brand" />
                  Radar innowacji
                </span>
                <span className="font-mono text-muted-foreground">3 wyniki</span>
              </div>
              <p className="text-sm">
                Znalazłem 3 projekty z NCBiR i RAD-on. Odznacz te, które nie pasują, a resztę
                zapiszemy w aspekcie.
              </p>
              {[
                ["Hydrometalurgiczny odzysk metali z ogniw Li-ion", "TRL 7/9", true],
                ["Mechaniczny demontaż pakietów bateryjnych", "TRL 5/9", true],
                ["Magazyny energii dla sieci miejskich", "brak oceny", false],
              ].map(([title, trl, on]) => (
                <div
                  key={title as string}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs",
                    !on && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border",
                      on && "border-brand bg-brand text-white",
                    )}
                  >
                    {on && <CheckIcon className="size-2.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{title}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
                      on && "border-brand/40 text-brand",
                    )}
                  >
                    {trl}
                  </span>
                </div>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px]">
                <PlusIcon className="size-3" />
                Znajdź więcej materiałów
              </span>
            </div>
          </div>
          <CardText
            title="Wyniki z uzasadnieniem i kontrolą"
            text="Każdy wynik ma opis, uzasadnienie „dlaczego pasuje”, link do źródła i ocenę TRL. Odznaczasz nieadekwatne, filtrujesz po źródle i TRL, a gdy za mało, prosisz o więcej materiałów."
          />
        </div>
      </FeatureCard>
    </div>
  );
}
