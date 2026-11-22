import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { PrintButton } from "@/components/need/print-button";
import { TrlBadge } from "@/components/search/result-list";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel, projectNumber } from "@/lib/numbering";
import { site } from "@/lib/site";
import { getNeedReport } from "@/queries/need";
import { phrasesSchema } from "@/validation/search";

export const metadata: Metadata = { title: "Raport projektu" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short" });

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Zbiorcze opracowanie projektu: dane projektu, materiały i wszystkie aspekty z wynikami.
// Układ nadaje się do druku: „Pobierz PDF” otwiera okno drukowania przeglądarki.
export default async function NeedReportPage({
  params,
}: PageProps<"/dashboard/projects/[id]/report">) {
  const { id } = await params;
  const need = await getNeedReport(id);
  if (!need) notFound();

  const totalResults = need.searches.reduce((sum, s) => sum + s.results.length, 0);

  return (
    <article className="mx-auto max-w-3xl space-y-6 print:max-w-none">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href="/dashboard/projects"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeftIcon />
          Projekty
        </Link>
        <PrintButton />
      </div>

      <header className="space-y-1 border-b pb-4">
        <p className="text-xs text-muted-foreground">
          {site.name} · raport z {dateFormat.format(new Date())}
        </p>
        <p className="font-mono text-sm text-muted-foreground">{projectNumber(need.createdAt)}</p>
        <h1 className="text-2xl font-semibold">{need.title}</h1>
        <p className="text-sm text-muted-foreground">
          {need.business.name}
          {need.business.city && ` · ${need.business.city}`}
          {need.business.nip && ` · NIP ${need.business.nip}`}
        </p>
        {need.sentAt && (
          <p className="text-xs text-muted-foreground">
            Raport wysłany do członków organizacji: {dateFormat.format(need.sentAt)}
          </p>
        )}
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Opis projektu</h2>
        <p className="text-sm whitespace-pre-line">{need.description}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Podsumowanie</h2>
        <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            ["Aspekty", need.searches.length],
            ["Wyniki", totalResults],
            ["Linki", need.linkUrls.length],
            ["Pliki PDF", need.files.length],
          ].map(([label, value]) => (
            <li key={label} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-medium">{value}</p>
            </li>
          ))}
        </ul>
      </section>

      {(need.linkUrls.length > 0 || need.files.length > 0) && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Materiały projektu</h2>
          <ul className="space-y-1 text-sm">
            {need.linkUrls.map((url) => (
              <li key={url} className="break-all">
                {url}
              </li>
            ))}
            {need.files.map((file) => (
              <li key={file.id}>
                {file.fileName} ({formatSize(file.size)})
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Aspekty i wyniki</h2>
        {need.searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Projekt nie ma jeszcze aspektów.</p>
        ) : (
          need.searches.map((search) => {
            const phrases = phrasesSchema.safeParse(search.phrases);
            return (
              <div
                key={search.id}
                className="space-y-3 break-inside-avoid-page rounded-lg border p-4"
              >
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {aspectLabel(search.number, need.createdAt) ?? "Aspekt"}
                  </p>
                  {phrases.success && phrases.data.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Frazy: </span>
                      {phrases.data.join("; ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Wyniki: {search.results.length}</p>
                </div>
                {search.results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak zapisanych wyników.</p>
                ) : (
                  <ol className="space-y-3">
                    {search.results.map((r, index) => (
                      <li
                        key={r.id}
                        className="space-y-1 border-t pt-3 text-sm first:border-t-0 first:pt-0"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-medium">
                            {index + 1}. {r.title}
                          </p>
                          <TrlBadge trl={r.trl} />
                        </div>
                        <p>{r.summary}</p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Dlaczego pasuje: </span>
                          {r.why}
                        </p>
                        <p className="text-xs break-all text-muted-foreground">
                          {r.sourceName}
                          {r.organization && ` · ${r.organization}`} · {r.sourceUrl}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })
        )}
      </section>
    </article>
  );
}
