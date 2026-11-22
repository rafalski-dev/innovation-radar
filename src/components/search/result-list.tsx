"use client";

import { useMemo, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { DEFAULT_TRL, TRL_LABELS, effectiveTrl } from "@/lib/trl";
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

// Wynik bez oceny TRL ze źródła ma TRL 2 (DEFAULT_TRL); plakietka zaznacza, że to wartość domyślna.
export function TrlBadge({ trl }: { trl?: number | null }) {
  const value = effectiveTrl(trl);
  if (trl == null) {
    return (
      <span
        title={`Źródło nie pozwala ocenić TRL, więc przyjęto TRL ${DEFAULT_TRL}: ${TRL_LABELS[value]}`}
        className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground"
      >
        TRL {value}/9 (domyślnie)
      </span>
    );
  }
  return (
    <span
      title={`TRL ${value}: ${TRL_LABELS[value]}`}
      className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"
    >
      TRL {value}/9
    </span>
  );
}

// Sama domena adresu źródła (bez https:// i ścieżki), do wyświetlenia pod nazwą źródła.
function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type SortKey = "default" | "trl-desc" | "trl-asc" | "title";

const selectClass =
  "h-8 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

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
      (i) =>
        (!source || i.sourceName === source) && (minTrl === 0 || effectiveTrl(i.trl) >= minTrl),
    );
    if (sort === "default") return filtered;
    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "pl");
      // brak oceny TRL liczy się jako TRL domyślny (DEFAULT_TRL)
      const diff = effectiveTrl(a.trl) - effectiveTrl(b.trl);
      return sort === "trl-desc" ? -diff : diff;
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
        <p className="rounded-2xl border border-dashed py-4 text-center text-sm text-muted-foreground">
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
                  "space-y-2 rounded-2xl border bg-card p-4 transition-opacity",
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
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                          Źródło
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 text-sm">
                          <span className="font-semibold text-brand">{r.sourceName}</span>
                          {r.organization && (
                            <span className="text-muted-foreground">{r.organization}</span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {hostOf(r.sourceUrl)}
                        </p>
                      </div>
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-white"
                      >
                        Otwórz źródło
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
