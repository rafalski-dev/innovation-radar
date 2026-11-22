"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BuildingIcon } from "lucide-react";
import { SearchRowActions } from "@/components/search/search-row-actions";
import { Input } from "@/components/shadcn/input";

export type SearchRow = {
  id: string;
  title: string | null; // nazwa aspektu (stare wpisy jej nie mają)
  query: string;
  canChange: boolean; // pokazuje „Kopiuj” i „Edytuj”
  label: string | null; // numer aspektu, np. PRJ-…/A2
  createdAt: string; // ISO
  createdLabel: string;
  projectId: string | null;
  projectTitle: string | null;
  businessName: string | null;
  resultsCount: number;
};

type SortKey = "newest" | "oldest" | "results" | "project";

const selectClass =
  "h-9 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Lista aspektów z filtrami (tekst, projekt, tylko z wynikami) i sortowaniem.
export function SearchList({ rows }: { rows: SearchRow[] }) {
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState("");
  const [onlyWithResults, setOnlyWithResults] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) if (r.projectId && r.projectTitle) map.set(r.projectId, r.projectTitle);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pl"));
  }, [rows]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (!q ||
          `${r.title ?? ""} ${r.query} ${r.projectTitle ?? ""} ${r.label ?? ""}`
            .toLowerCase()
            .includes(q)) &&
        (!projectId || r.projectId === projectId) &&
        (!onlyWithResults || r.resultsCount > 0),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "results") return b.resultsCount - a.resultsCount;
      if (sort === "project")
        return (
          (a.projectTitle ?? "").localeCompare(b.projectTitle ?? "", "pl") ||
          b.createdAt.localeCompare(a.createdAt)
        );
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [rows, text, projectId, onlyWithResults, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Szukaj w aspektach…"
          className="max-w-56"
        />
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={selectClass}
        >
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
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Żaden aspekt nie spełnia filtrów.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((s) => (
            <li
              key={s.id}
              className="relative flex items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-brand/50"
            >
              <div className="min-w-0 flex-1 space-y-1">
                {s.label && <p className="font-mono text-xs text-muted-foreground">{s.label}</p>}
                <Link
                  href={`/dashboard/search/${s.id}`}
                  className={
                    s.title
                      ? "line-clamp-2 block text-sm font-medium after:absolute after:inset-0 after:content-['']"
                      : "line-clamp-3 block text-sm after:absolute after:inset-0 after:content-['']"
                  }
                >
                  {s.title ?? s.query}
                </Link>
                {s.title && <p className="line-clamp-1 text-xs text-muted-foreground">{s.query}</p>}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={s.createdAt}>{s.createdLabel}</time>
                  {s.projectTitle && (
                    <span className="inline-flex items-center gap-1">
                      <BuildingIcon className="size-3" />
                      {s.projectTitle} · {s.businessName}
                    </span>
                  )}
                  <span>Wyniki: {s.resultsCount}</span>
                </div>
              </div>
              <div className="relative z-10">
                <SearchRowActions
                  id={s.id}
                  name={s.title ?? s.projectTitle ?? "aspekt"}
                  canChange={s.canChange}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
