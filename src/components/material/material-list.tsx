"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLinkIcon, SparklesIcon } from "lucide-react";
import { TrlBadge } from "@/components/search/result-list";
import { Input } from "@/components/shadcn/input";
import { effectiveTrl } from "@/lib/trl";

export type MaterialRow = {
  id: string;
  title: string;
  summary: string;
  why: string; // kontekst AI: uzasadnienie dopasowania
  organization: string | null;
  sourceName: string;
  sourceUrl: string;
  trl: number | null;
  aspectId: string;
  aspectTitle: string;
  phrases: string[]; // frazy, na podstawie których agent znalazł materiał
  projectTitle: string | null;
  authorEmail: string;
  createdAt: string;
  createdLabel: string;
};

const selectClass =
  "h-9 rounded-full border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const TRL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Biblioteka materiałów: wszystkie zapisane wyniki z kontekstem AI, z wyszukiwaniem i filtrami (źródło, projekt, TRL).
export function MaterialList({ rows }: { rows: MaterialRow[] }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [project, setProject] = useState("");
  const [trlFrom, setTrlFrom] = useState(1);
  const [trlTo, setTrlTo] = useState(9);

  const sources = useMemo(
    () => [...new Set(rows.map((r) => r.sourceName))].sort((a, b) => a.localeCompare(b, "pl")),
    [rows],
  );
  const projects = useMemo(
    () =>
      [...new Set(rows.flatMap((r) => (r.projectTitle ? [r.projectTitle] : [])))].sort((a, b) =>
        a.localeCompare(b, "pl"),
      ),
    [rows],
  );

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return rows.filter((r) => {
      const trl = effectiveTrl(r.trl);
      return (
        (!q ||
          `${r.title} ${r.summary} ${r.why} ${r.organization ?? ""} ${r.aspectTitle} ${r.phrases.join(" ")}`
            .toLowerCase()
            .includes(q)) &&
        (!source || r.sourceName === source) &&
        (!project || r.projectTitle === project) &&
        trl >= trlFrom &&
        trl <= trlTo
      );
    });
  }, [rows, text, source, project, trlFrom, trlTo]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Szukaj w materiałach…"
          className="max-w-64"
          aria-label="Szukaj w materiałach"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={selectClass}
          aria-label="Źródło"
        >
          <option value="">Wszystkie źródła</option>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className={selectClass}
          aria-label="Projekt"
        >
          <option value="">Wszystkie projekty</option>
          {projects.map((p) => (
            <option key={p}>{p}</option>
          ))}
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
              <option key={l}>{l}</option>
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
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        {visible.length !== rows.length && (
          <span className="text-xs text-muted-foreground">
            Pokazano {visible.length} z {rows.length}
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Żaden materiał nie spełnia filtrów.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((m) => (
            <li key={m.id} className="space-y-2 rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-medium">{m.title}</h3>
                <TrlBadge trl={m.trl} />
              </div>
              <p className="text-sm">{m.summary}</p>
              <div className="space-y-1 rounded-xl border bg-muted/40 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <SparklesIcon className="size-3.5" />
                  Kontekst AI: dlaczego pasuje
                </p>
                <p className="text-muted-foreground">{m.why}</p>
                {m.phrases.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Frazy wyszukiwania: {m.phrases.join("; ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-2"
                >
                  {m.sourceName}
                  {m.organization && ` · ${m.organization}`}
                  <ExternalLinkIcon className="size-3" />
                </a>
                <span>
                  Aspekt:{" "}
                  <Link href={`/dashboard/search/${m.aspectId}`} className="underline">
                    {m.aspectTitle}
                  </Link>
                </span>
                {m.projectTitle && <span>Projekt: {m.projectTitle}</span>}
                <span className="break-all">Autor: {m.authorEmail}</span>
                <time dateTime={m.createdAt}>{m.createdLabel}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
