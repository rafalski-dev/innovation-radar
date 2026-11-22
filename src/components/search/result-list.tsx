"use client";

import { useMemo, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResultItem = {
  title: string;
  summary: string;
  organization?: string | null;
  sourceName: string;
  sourceUrl: string;
  why: string;
  trl?: number | null;
};

// Skala gotowości technologicznej (TRL) w skrócie: podpowiedź przy plakietce.
const TRL_LABELS: Record<number, string> = {
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

export function TrlBadge({ trl }: { trl?: number | null }) {
  if (!trl) {
    return (
      <span className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
        TRL: brak oceny
      </span>
    );
  }
  return (
    <span
      title={`TRL ${trl}: ${TRL_LABELS[trl]}`}
      className="rounded-full border bg-muted px-2 py-0.5 text-xs font-medium"
    >
      TRL {trl}/9
    </span>
  );
}

type SortKey = "default" | "trl-desc" | "trl-asc" | "title";

const selectClass =
  "h-8 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Lista wyników agenta (karty z opisem, uzasadnieniem, TRL i linkiem do źródła).
// `selection` włącza checkboxy (wykluczanie nieadekwatnych wyników przed zatwierdzeniem aspektu).
export function ResultList({
  items,
  selection,
}: {
  items: ResultItem[];
  selection?: { selected: string[]; onToggle: (url: string) => void };
}) {
  const [source, setSource] = useState("");
  const [minTrl, setMinTrl] = useState(0);
  const [sort, setSort] = useState<SortKey>("default");

  const sources = useMemo(() => [...new Set(items.map((i) => i.sourceName))].sort(), [items]);

  const visible = useMemo(() => {
    const filtered = items.filter(
      (i) => (!source || i.sourceName === source) && (minTrl === 0 || (i.trl ?? 0) >= minTrl),
    );
    if (sort === "default") return filtered;
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "pl");
      // wyniki bez oceny TRL zawsze na końcu
      const av = a.trl ?? (sort === "trl-desc" ? -1 : 99);
      const bv = b.trl ?? (sort === "trl-desc" ? -1 : 99);
      return sort === "trl-desc" ? bv - av : av - bv;
    });
  }, [items, source, minTrl, sort]);

  return (
    <div className="space-y-3">
      {items.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-1.5 text-muted-foreground">
            Źródło
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={selectClass}
            >
              <option value="">Wszystkie</option>
              {sources.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-muted-foreground">
            TRL od
            <select
              value={minTrl}
              onChange={(e) => setMinTrl(Number(e.target.value))}
              className={selectClass}
            >
              <option value={0}>Dowolny</option>
              {[3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-muted-foreground">
            Sortuj
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={selectClass}
            >
              <option value="default">Kolejność agenta</option>
              <option value="trl-desc">TRL malejąco</option>
              <option value="trl-asc">TRL rosnąco</option>
              <option value="title">Tytuł A–Z</option>
            </select>
          </label>
          {(source || minTrl > 0) && (
            <span className="text-xs text-muted-foreground">
              Pokazano {visible.length} z {items.length}
            </span>
          )}
        </div>
      )}
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
          Żaden wynik nie spełnia filtrów.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((r) => {
            const checked = selection?.selected.includes(r.sourceUrl) ?? true;
            return (
              <li
                key={r.sourceUrl}
                className={cn(
                  "space-y-2 rounded-lg border p-4 transition-opacity",
                  selection && !checked && "opacity-50",
                )}
              >
                <div className="flex items-start gap-3">
                  {selection && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => selection.onToggle(r.sourceUrl)}
                      aria-label={`Uwzględnij: ${r.title}`}
                      className="mt-1.5 accent-current"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium">{r.title}</p>
                      <TrlBadge trl={r.trl} />
                    </div>
                    <p className="text-sm">{r.summary}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Dlaczego pasuje: </span>
                      {r.why}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{r.sourceName}</span>
                      {r.organization && <span>{r.organization}</span>}
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Źródło
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
