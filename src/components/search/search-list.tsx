"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchRowActions } from "@/components/search/search-row-actions";
import { Input } from "@/components/shadcn/input";

export type SearchRow = {
  id: string;
  title: string; // nazwa aspektu (dla starych wpisów „Aspekt A3”)
  query: string;
  isMine: boolean; // akcje (kopiuj, edytuj, usuń) tylko dla autora
  canChange: boolean; // pokazuje „Kopiuj” i „Edytuj”
  label: string | null; // numer aspektu, np. PRJ-…/A2
  createdAt: string; // ISO
  createdLabel: string;
  projectId: string | null;
  projectTitle: string | null;
  businessName: string | null;
  phrases: string[]; // słowa wyszukiwań (frazy aspektu)
  sources: string[]; // użyte bazy (źródła wyników)
  searchesCount: number; // liczba wyszukiwań (zapisanych wyników agenta)
  trlMin: number | null;
  trlMax: number | null;
  authorEmail: string;
};

type SortKey = "newest" | "oldest" | "results" | "project";

const TRL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const selectClass =
  "h-9 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Lista aspektów z filtrami (tekst, projekt, tylko z wynikami) i sortowaniem.
export function SearchList({ rows }: { rows: SearchRow[] }) {
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState("");
  const [onlyWithResults, setOnlyWithResults] = useState(false);
  const [trlFrom, setTrlFrom] = useState(1);
  const [trlTo, setTrlTo] = useState(9);
  const [sort, setSort] = useState<SortKey>("newest");

  const projects = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) if (r.projectId && r.projectTitle) map.set(r.projectId, r.projectTitle);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "pl"));
  }, [rows]);

  const trlFilterActive = trlFrom > 1 || trlTo < 9;

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (!q ||
          `${r.title} ${r.query} ${r.projectTitle ?? ""} ${r.label ?? ""} ${r.phrases.join(" ")} ${r.sources.join(" ")} ${r.authorEmail}`
            .toLowerCase()
            .includes(q)) &&
        (!projectId || r.projectId === projectId) &&
        (!onlyWithResults || r.searchesCount > 0) &&
        // filtr TRL: rozpiętość aspektu ma się przecinać z wybranym zakresem (bez wyszukiwań: ukryty, gdy filtr aktywny)
        (!trlFilterActive ||
          (r.trlMin !== null && r.trlMax !== null && r.trlMax >= trlFrom && r.trlMin <= trlTo)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "results") return b.searchesCount - a.searchesCount;
      if (sort === "project")
        return (
          (a.projectTitle ?? "").localeCompare(b.projectTitle ?? "", "pl") ||
          b.createdAt.localeCompare(a.createdAt)
        );
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [rows, text, projectId, onlyWithResults, sort, trlFrom, trlTo, trlFilterActive]);

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
          <option value="results">Najwięcej wyszukiwań</option>
          <option value="project">Wg projektu</option>
        </select>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>TRL od</span>
          <select
            aria-label="TRL od"
            value={trlFrom}
            onChange={(e) => {
              const v = Number(e.target.value);
              setTrlFrom(v);
              if (v > trlTo) setTrlTo(v);
            }}
            className={selectClass}
          >
            {TRL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <span>do</span>
          <select
            aria-label="TRL do"
            value={trlTo}
            onChange={(e) => {
              const v = Number(e.target.value);
              setTrlTo(v);
              if (v < trlFrom) setTrlFrom(v);
            }}
            className={selectClass}
          >
            {TRL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyWithResults}
            onChange={(e) => setOnlyWithResults(e.target.checked)}
            className="accent-current"
          />
          Tylko z wyszukiwaniami
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
              <div className="min-w-0 flex-1 space-y-2">
                {s.label && <p className="font-mono text-xs text-muted-foreground">{s.label}</p>}
                <Link
                  href={`/dashboard/search/${s.id}`}
                  className="line-clamp-2 block text-sm font-medium after:absolute after:inset-0 after:content-['']"
                >
                  {s.title}
                </Link>
                {s.phrases.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Słowa wyszukiwań">
                    {s.phrases.map((p) => (
                      <li key={p} className="rounded-full border px-2 py-0.5 text-[11px]">
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                <dl className="grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-[auto_1fr]">
                  <dt className="text-muted-foreground">Projekt</dt>
                  <dd className="font-medium">
                    {s.projectTitle ? `${s.projectTitle} · ${s.businessName}` : "bez projektu"}
                  </dd>
                  <dt className="text-muted-foreground">Użyte bazy</dt>
                  <dd className="font-medium">
                    {s.sources.length > 0 ? s.sources.join(", ") : "—"}
                  </dd>
                  <dt className="text-muted-foreground">Wyszukiwania</dt>
                  <dd className="font-medium">{s.searchesCount}</dd>
                  <dt className="text-muted-foreground">Rozpiętość TRL</dt>
                  <dd className="font-medium">
                    {s.trlMin === null || s.trlMax === null
                      ? "—"
                      : s.trlMin === s.trlMax
                        ? `TRL ${s.trlMin}`
                        : `TRL ${s.trlMin}–${s.trlMax}`}
                  </dd>
                  <dt className="text-muted-foreground">Autor aspektu</dt>
                  <dd className="font-medium break-all">{s.authorEmail}</dd>
                </dl>
                <time dateTime={s.createdAt} className="block text-[11px] text-muted-foreground">
                  {s.createdLabel}
                </time>
              </div>
              {s.isMine && (
                <div className="relative z-10">
                  <SearchRowActions id={s.id} name={s.title} canChange={s.canChange} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
