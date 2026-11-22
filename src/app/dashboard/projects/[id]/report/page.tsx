import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CompassIcon } from "lucide-react";
import { PrintButton } from "@/components/need/print-button";
import { TrlBadge } from "@/components/search/result-list";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel, aspectTitle, projectNumber } from "@/lib/numbering";
import { pickNextStep, summarizeAspect } from "@/lib/report";
import { site } from "@/lib/site";
import { TRL_BANDS, TRL_LABELS, formatTrlRange, trlRange } from "@/lib/trl";
import { getNeedReport } from "@/queries/need";
import { phrasesSchema } from "@/validation/search";

export const metadata: Metadata = { title: "Raport projektu" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short" });

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const formatAverage = (value: number | null) =>
  value == null ? "—" : value.toFixed(1).replace(".", ",");

// Zbiorcze opracowanie projektu (tylko na poziomie projektu): dane projektu, rekomendowany następny krok,
// podsumowanie każdego aspektu z rozpiętością TRL oraz wszystkie aspekty z wynikami.
// Układ nadaje się do druku: „Pobierz PDF” otwiera okno drukowania przeglądarki.
export default async function NeedReportPage({
  params,
}: PageProps<"/dashboard/projects/[id]/report">) {
  const { id } = await params;
  const need = await getNeedReport(id);
  if (!need) notFound();

  const allResults = need.searches.flatMap((s) => s.results);
  const projectRange = trlRange(allResults.map((r) => r.trl));
  const nextStep = pickNextStep(need.searches);
  const nextStepTitle = nextStep && aspectTitle(nextStep.aspect.title, nextStep.aspect.number);

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
        <PrintButton projectTitle={need.title} />
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
        <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          {[
            ["Aspekty", need.searches.length],
            ["Wyniki", allResults.length],
            ["Rozpiętość TRL", projectRange ? formatTrlRange(projectRange) : "—"],
            ["Linki", need.linkUrls.length],
            ["Pliki PDF", need.files.length],
          ].map(([label, value]) => (
            <li key={label} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-medium">{value}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Wynik bez oceny TRL ze źródła liczymy jako TRL 2.
        </p>
      </section>

      <section
        aria-labelledby="next-step-title"
        className="space-y-2 rounded-lg border border-brand/40 bg-brand/5 p-4 break-inside-avoid-page"
      >
        <h2 id="next-step-title" className="flex items-center gap-2 text-lg font-medium">
          <CompassIcon className="size-5 text-brand" />
          Rekomendowany następny krok
        </h2>
        {nextStep ? (
          <>
            <p className="text-sm">
              Kontynuuj aspekt <span className="font-semibold">„{nextStepTitle}”</span>
              {aspectLabel(nextStep.aspect.number, need.createdAt) && (
                <span className="font-mono text-xs text-muted-foreground">
                  {" "}
                  ({aspectLabel(nextStep.aspect.number, need.createdAt)})
                </span>
              )}
              : ma najwyższy poziom TRL w wynikach wyszukiwania (TRL {nextStep.maxTrl}/9:{" "}
              {TRL_LABELS[nextStep.maxTrl]}).
            </p>
            {nextStep.summary.best && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Najbardziej dojrzały wynik: </span>
                {nextStep.summary.best.title} · {nextStep.summary.best.sourceName}
                <span className="block text-xs break-all">{nextStep.summary.best.sourceUrl}</span>
              </p>
            )}
            {nextStep.onlyAssumed && (
              <p className="text-xs text-muted-foreground">
                Uwaga: żaden wynik tego aspektu nie ma oceny TRL ze źródła (przyjęto TRL 2), więc
                rekomendacja jest orientacyjna.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Brak wyników w aspektach, więc nie ma z czego wskazać następnego kroku. Dodaj aspekt z
            wynikami wyszukiwania.
          </p>
        )}
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

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Podsumowanie aspektów</h2>
        {need.searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Projekt nie ma jeszcze aspektów.</p>
        ) : (
          <ul className="space-y-3">
            {need.searches.map((search) => {
              const summary = summarizeAspect(search.results);
              const recommended = nextStep?.aspect.id === search.id;
              const phrases = phrasesSchema.safeParse(search.phrases);
              return (
                <li
                  key={search.id}
                  className="space-y-2 break-inside-avoid-page rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{aspectTitle(search.title, search.number)}</p>
                      {aspectLabel(search.number, need.createdAt) && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {aspectLabel(search.number, need.createdAt)}
                        </p>
                      )}
                    </div>
                    {recommended && (
                      <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                        Rekomendowany następny krok
                      </span>
                    )}
                  </div>
                  {summary.count === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak zapisanych wyników, więc nie ma rozpiętości TRL.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Rozpiętość TRL: </span>
                        {formatTrlRange(summary.range)}
                        <span className="text-muted-foreground">
                          {" "}
                          (średnio {formatAverage(summary.average)})
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Wyniki: {summary.count} · źródła: {summary.sources.join(", ")}
                        {summary.rated < summary.count &&
                          ` · bez oceny TRL (liczone jako TRL 2): ${summary.count - summary.rated}`}
                      </p>
                      <ul className="flex flex-wrap gap-2 text-xs">
                        {TRL_BANDS.map((band) => (
                          <li key={band.key} className="rounded-full border px-2 py-0.5">
                            {band.label} (TRL {band.from}–{band.to}): {summary.bands[band.key]}
                          </li>
                        ))}
                      </ul>
                      {summary.best && (
                        <p className="text-sm">
                          <span className="font-medium">Najbardziej dojrzały wynik: </span>
                          {summary.best.title}
                          <span className="text-muted-foreground">
                            {" "}
                            · {summary.best.sourceName}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                  {phrases.success && phrases.data.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Frazy: {phrases.data.join("; ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Aspekty i wyniki</h2>
        {need.searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">Projekt nie ma jeszcze aspektów.</p>
        ) : (
          need.searches.map((search) => {
            const range = trlRange(search.results.map((r) => r.trl));
            return (
              <div
                key={search.id}
                className="space-y-3 break-inside-avoid-page rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{aspectTitle(search.title, search.number)}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {aspectLabel(search.number, need.createdAt) ?? "Aspekt"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Wyniki: {search.results.length}
                    {range && ` · ${formatTrlRange(range)}`}
                  </p>
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
                        <p className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs break-all text-muted-foreground">
                          <span className="font-semibold text-brand">Źródło: {r.sourceName}</span>
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
