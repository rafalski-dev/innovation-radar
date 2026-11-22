import { TRL_BANDS, effectiveTrl, trlRange, type TrlBandKey, type TrlRange } from "@/lib/trl";

// Obliczenia do raportu zbiorczego projektu: podsumowanie każdego aspektu i rekomendowany następny krok.
// Same funkcje bez dostępu do bazy, żeby dało się je przetestować.
export type ReportResult = {
  id: string;
  title: string;
  sourceName: string;
  trl: number | null;
};

export type ReportAspect<R extends ReportResult = ReportResult> = {
  id: string;
  number: number;
  results: R[];
};

export type AspectSummary<R extends ReportResult> = {
  count: number;
  range: TrlRange | null;
  average: number | null;
  rated: number; // wyniki z oceną TRL ze źródła (reszta ma TRL domyślny)
  sources: string[];
  bands: Record<TrlBandKey, number>;
  best: R | null; // wynik o najwyższym TRL (przy remisie pierwszy wg kolejności agenta)
};

export function summarizeAspect<R extends ReportResult>(results: R[]): AspectSummary<R> {
  const bands: Record<TrlBandKey, number> = { research: 0, prototype: 0, deployment: 0 };
  let best: R | null = null;
  let sum = 0;
  for (const r of results) {
    const trl = effectiveTrl(r.trl);
    sum += trl;
    const band = TRL_BANDS.find((b) => trl >= b.from && trl <= b.to);
    if (band) bands[band.key]++;
    if (!best || trl > effectiveTrl(best.trl)) best = r;
  }
  return {
    count: results.length,
    range: trlRange(results.map((r) => r.trl)),
    average: results.length > 0 ? sum / results.length : null,
    rated: results.filter((r) => r.trl != null).length,
    sources: [...new Set(results.map((r) => r.sourceName))].sort((a, b) =>
      a.localeCompare(b, "pl"),
    ),
    bands,
    best,
  };
}

export type NextStep<A extends ReportAspect> = {
  aspect: A;
  summary: AspectSummary<A["results"][number]>;
  maxTrl: number;
  // najwyższy TRL pochodzi wyłącznie z wartości domyślnej (żaden wynik aspektu nie ma oceny ze źródła)
  onlyAssumed: boolean;
};

// Rekomendowany następny krok = aspekt z najwyższym TRL w wynikach wyszukiwania.
// Remis rozstrzygają kolejno: więcej wyników na tym poziomie, wyższa średnia, niższy numer aspektu.
export function pickNextStep<A extends ReportAspect>(aspects: A[]): NextStep<A> | null {
  let winner: (NextStep<A> & { atMax: number }) | null = null;
  for (const aspect of aspects) {
    if (aspect.results.length === 0) continue;
    const summary = summarizeAspect(aspect.results);
    const maxTrl = summary.range?.max ?? 0;
    const atMax = aspect.results.filter((r) => effectiveTrl(r.trl) === maxTrl).length;
    const candidate = { aspect, summary, maxTrl, onlyAssumed: summary.rated === 0, atMax };
    if (!winner || isBetter(candidate, winner)) winner = candidate;
  }
  if (!winner) return null;
  const { aspect, summary, maxTrl, onlyAssumed } = winner;
  return { aspect, summary, maxTrl, onlyAssumed };
}

function isBetter<A extends ReportAspect>(
  a: NextStep<A> & { atMax: number },
  b: NextStep<A> & { atMax: number },
) {
  if (a.maxTrl !== b.maxTrl) return a.maxTrl > b.maxTrl;
  if (a.atMax !== b.atMax) return a.atMax > b.atMax;
  const avgA = a.summary.average ?? 0;
  const avgB = b.summary.average ?? 0;
  if (avgA !== avgB) return avgA > avgB;
  return a.aspect.number > 0 && (b.aspect.number <= 0 || a.aspect.number < b.aspect.number);
}
