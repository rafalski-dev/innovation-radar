import { CheckIcon, FileTextIcon, PlusIcon, SendIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Uproszczone makiety ekranów aplikacji do karuzeli na landing page (dane przykładowe).
const panel = "rounded-lg border bg-background p-3 text-xs";
const chip = "rounded-full border px-2.5 py-1 text-[11px]";
const fakeButton =
  "inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-[11px] font-medium";

export function ProjectMock() {
  return (
    <div className="space-y-2.5">
      <div className={panel}>
        <p className="text-[10px] text-muted-foreground">Tytuł projektu</p>
        <p className="font-medium">Recykling zużytych baterii litowo-jonowych</p>
      </div>
      <div className={panel}>
        <p className="text-[10px] text-muted-foreground">Opis</p>
        <p className="text-muted-foreground">
          Szukamy technologii odzysku litu i kobaltu z baterii z pojazdów elektrycznych…
        </p>
      </div>
      <span className={fakeButton}>
        <SparklesIcon className="size-3 text-brand-blue" />
        Zaproponuj uzupełnienia z AI
      </span>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Cel", "Odzysk metali strategicznych"],
          ["Ograniczenia", "Bezpieczny demontaż ogniw"],
        ].map(([label, text]) => (
          <div key={label} className={cn(panel, "flex items-start gap-1.5")}>
            <PlusIcon className="mt-0.5 size-3 shrink-0 text-brand-green" />
            <span>
              <span className="block font-medium">{label}</span>
              <span className="text-muted-foreground">{text}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhrasesMock() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium">Krok 1. Frazy do wyszukiwarki</p>
      <div className="flex flex-wrap gap-2">
        {[
          "recykling baterii litowo-jonowych",
          "odzysk litu i kobaltu hydrometalurgia",
          "mechaniczny demontaż pakietów bateryjnych",
          "separacja frakcji czarnej masy",
        ].map((p) => (
          <span key={p} className={chip}>
            {p}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={fakeButton}>
          <SparklesIcon className="size-3 text-brand-blue" />
          Generuj kolejną frazę
        </span>
        <span className={cn(panel, "min-w-0 flex-1 py-1.5 text-muted-foreground")}>
          Wskazówka, np. „bardziej technicznie”
        </span>
      </div>
      <span className={cn(fakeButton, "bg-foreground text-background")}>
        <CheckIcon className="size-3" />
        Zatwierdź frazy
      </span>
    </div>
  );
}

export function SourcesMock() {
  const sources = [
    ["NCBiR", "projekty B+R", true],
    ["RAD-on", "patenty, projekty i instytucje naukowe", true],
    ["Mapa Dotacji UE", "projekty z funduszy UE", false],
    ["Interreg", "projekty współpracy regionów", false],
  ] as const;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {sources.map(([name, text, on]) => (
          <div
            key={name}
            className={cn(
              panel,
              "flex items-start gap-2",
              on ? "border-brand-blue/60 bg-brand-blue/5" : "opacity-50",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded border",
                on && "border-brand-blue bg-brand-blue text-white",
              )}
            >
              {on && <CheckIcon className="size-2.5" strokeWidth={3} />}
            </span>
            <span>
              <span className="block font-medium">{name}</span>
              <span className="text-muted-foreground">{text}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Wybrano 2 z 2</p>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span>Liczba wyników</span>
        <span className={cn(panel, "px-3 py-1")}>5</span>
        <span className={cn(fakeButton, "bg-foreground text-background")}>Szukaj w źródłach</span>
      </div>
    </div>
  );
}

export function ResultsMock() {
  return (
    <div className="space-y-2.5">
      <div className={cn(panel, "space-y-1.5")}>
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-start gap-2 text-[13px] font-medium">
            <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded border border-brand-blue bg-brand-blue text-white">
              <CheckIcon className="size-2.5" strokeWidth={3} />
            </span>
            Hydrometalurgiczny odzysk metali z ogniw Li-ion
          </p>
          <span className="shrink-0 rounded-full border border-brand-green/60 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium">
            TRL 7/9
          </span>
        </div>
        <p className="pl-5 text-muted-foreground">
          <span className="font-medium text-foreground">Dlaczego pasuje: </span>
          etap wdrożenia przemysłowego, można wejść we współpracę.
        </p>
        <p className="pl-5 text-[10px] text-muted-foreground">NCBiR · link do źródła</p>
      </div>
      <div className={cn(panel, "space-y-1.5 opacity-50")}>
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-start gap-2 text-[13px] font-medium">
            <span className="mt-0.5 size-3.5 shrink-0 rounded border" />
            Nieadekwatny wynik, odznaczony przez użytkownika
          </p>
          <span className="shrink-0 rounded-full border border-dashed px-2 py-0.5 text-[10px]">
            TRL: brak oceny
          </span>
        </div>
      </div>
      <span className={cn(fakeButton, "bg-foreground text-background")}>
        <PlusIcon className="size-3" />
        Znajdź więcej materiałów
      </span>
    </div>
  );
}

export function ReportMock() {
  return (
    <div className="space-y-3">
      <div className={cn(panel, "space-y-1.5")}>
        <p className="font-mono text-[10px] text-muted-foreground">PRJ-20261122-033916</p>
        <p className="text-[13px] font-semibold">Recykling zużytych baterii litowo-jonowych</p>
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            ["Aspekty", "2"],
            ["Wyniki", "7"],
            ["Źródła", "3"],
            ["Pliki PDF", "1"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-1.5">
              <p className="text-[9px] text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={fakeButton}>
          <FileTextIcon className="size-3" />
          Pobierz PDF
        </span>
        <span className={fakeButton}>
          <SendIcon className="size-3" />
          Wyślij raport do zespołu
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Po wysłaniu raportu projekt jest zamknięty do edycji.
      </p>
    </div>
  );
}
