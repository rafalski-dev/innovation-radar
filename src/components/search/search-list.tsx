"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BuildingIcon } from "lucide-react";
import { SearchRowActions } from "@/components/search/search-row-actions";
import { Input } from "@/components/shadcn/input";

export type SearchRow = {
  id: string;
  query: string;
  label: string | null; // numer aspektu, np. PRJ-…/A2
  createdAt: string; // ISO
  createdLabel: string;
  needId: string | null;
  needTitle: string | null;
  businessName: string | null;
  resultsCount: number;
};

type SortKey = "newest" | "oldest" | "results" | "project";

const selectClass =
  "h-9 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Lista aspektów z filtrami (tekst, projekt, tylko z wynikami) i sortowaniem.
export function SearchList({ rows }: { rows: SearchRow[] }) {
  const [text, setText] = useState("");
  const [needId, setNeedId] = useState("");
  const [onlyWithResults, setOnlyWithResults] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) if (r.needId && r.needTitle) map.set(r.needId, r.needTitle);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pl"));
  }, [rows]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (!q || `${r.query} ${r.needTitle ?? ""} ${r.label ?? ""}`.toLowerCase().includes(q)) &&
        (!needId || r.needId === needId) &&
        (!onlyWithResults || r.resultsCount > 0),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "results") return b.resultsCount - a.resultsCount;
      if (sort === "project")
        return (
          (a.needTitle ?? "").localeCompare(b.needTitle ?? "", "pl") ||
          b.createdAt.localeCompare(a.createdAt)
        );
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [rows, text, needId, onlyWithResults, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Szukaj w aspektach…"
          className="max-w-56"
        />
        <select value={needId} onChange={(e) => setNeedId(e.target.value)} className={selectClass}>
          <option value="">Wszystkie projekty</option>
          {projects.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={selectClass}
        >
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="results">Najwięcej wyników</option>
          <option value="project">Wg projektu</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyWithResults}
            onChange={(e) => setOnlyWithResults(e.target.checked)}
            className="accent-current"
          />
          Tylko z wynikami
        </label>
        {visible.length !== rows.length && (
          <span className="text-xs text-muted-foreground">
            Pokazano {visible.length} z {rows.length}
          </span>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Żaden aspekt nie spełnia filtrów.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((s) => (
            <li
              key={s.id}
              className="relative flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1 space-y-1">
                {s.label && <p className="font-mono text-xs text-muted-foreground">{s.label}</p>}
                <Link
                  href={`/dashboard/search/${s.id}`}
                  className="line-clamp-3 block text-sm after:absolute after:inset-0 after:content-['']"
                >
                  {s.query}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={s.createdAt}>{s.createdLabel}</time>
                  {s.needTitle && (
                    <span className="inline-flex items-center gap-1">
                      <BuildingIcon className="size-3" />
                      {s.needTitle} · {s.businessName}
                    </span>
                  )}
                  <span>Wyniki: {s.resultsCount}</span>
                </div>
              </div>
              <div className="relative z-10">
                <SearchRowActions id={s.id} name={s.needTitle ?? "aspekt"} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
