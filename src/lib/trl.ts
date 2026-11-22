// Skala gotowości technologicznej (TRL 1-9). Wynik, którego agent nie umiał ocenić ze źródła
// (trl = null), liczymy jako TRL 2: w bazie zostaje null, a w widokach i raporcie podstawiamy tę wartość.
export const DEFAULT_TRL = 2;

// Skala gotowości technologicznej (TRL) w skrócie: podpowiedź przy plakietce i opis w raporcie.
export const TRL_LABELS: Record<number, string> = {
  1: "Zaobserwowano podstawowe zasady",
  2: "Sformułowano koncepcję technologii",
  3: "Dowód słuszności koncepcji (laboratorium)",
  4: "Walidacja w laboratorium",
  5: "Walidacja w warunkach zbliżonych do rzeczywistych",
  6: "Demonstracja prototypu w warunkach zbliżonych do rzeczywistych",
  7: "Demonstracja prototypu w warunkach rzeczywistych",
  8: "System zakończony i zakwalifikowany",
  9: "System sprawdzony w eksploatacji",
};

export function effectiveTrl(trl: number | null | undefined) {
  return trl != null && trl >= 1 && trl <= 9 ? trl : DEFAULT_TRL;
}

export type TrlRange = { min: number; max: number };

// Rozpiętość TRL listy wyników (puste oceny liczą się jako DEFAULT_TRL). Brak wyników = null.
export function trlRange(trls: (number | null | undefined)[]): TrlRange | null {
  if (trls.length === 0) return null;
  const values = trls.map(effectiveTrl);
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function formatTrlRange(range: TrlRange | null) {
  if (!range) return "brak wyników";
  return range.min === range.max ? `TRL ${range.min}` : `TRL ${range.min}–${range.max}`;
}

// Grupy dojrzałości do podsumowań: od badań po wdrożenie.
export const TRL_BANDS = [
  { key: "research", label: "Badania", from: 1, to: 3 },
  { key: "prototype", label: "Prototyp", from: 4, to: 6 },
  { key: "deployment", label: "Wdrożenie", from: 7, to: 9 },
] as const;

export type TrlBandKey = (typeof TRL_BANDS)[number]["key"];
