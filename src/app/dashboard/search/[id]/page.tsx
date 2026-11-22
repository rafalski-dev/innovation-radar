import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResultList } from "@/components/search/result-list";
import { SearchRowActions } from "@/components/search/search-row-actions";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel } from "@/lib/numbering";
import { formatTrlRange, trlRange } from "@/lib/trl";
import { getSearch } from "@/queries/search";
import { SEARCH_STATUS_LABELS, phrasesSchema, type SearchStatusValue } from "@/validation/search";

export const metadata: Metadata = { title: "Aspekt" };

export default async function SearchDetailPage({ params }: PageProps<"/dashboard/search/[id]">) {
  const { id } = await params;
  const search = await getSearch(id);
  if (!search) notFound();

  const phrases = phrasesSchema.safeParse(search.phrases);
  const phraseList = phrases.success ? phrases.data : [];
  const status = search.status as SearchStatusValue;
  const label = aspectLabel(search.number, search.project?.createdAt);
  const closed = !!search.project?.sentAt;
  const range = trlRange(search.results.map((r) => r.trl));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeftIcon />
        Wszystkie aspekty
      </Link>
      <PageHeader
        title={search.title ?? search.project?.title ?? "Aspekt"}
        description={[
          label,
          search.title && search.project ? search.project.title : null,
          search.project ? search.project.business.name : search.query,
        ]
          .filter(Boolean)
          .join(" · ")}
        action={
          <SearchRowActions
            id={search.id}
            name={search.title ?? search.project?.title ?? "aspekt"}
            canChange={!!search.project && !closed}
            redirectAfterDelete="/dashboard/search"
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {search.project &&
          (closed ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Raport projektu został wysłany, więc nie można dodawać, kopiować ani edytować
              aspektów.
            </p>
          ) : (
            <Link
              href={`/dashboard/search/new?project=${search.project.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <PlusIcon />
              Dodaj kolejny aspekt
            </Link>
          ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Frazy</h2>
        {phraseList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ten aspekt nie ma zapisanych fraz. Utwórz nowy z wygenerowanymi frazami.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {phraseList.map((p) => (
              <li key={p} className="rounded-full border px-3 py-1 text-sm">
                {p}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Wyniki agenta ({search.results.length})</h2>
          <p className="text-xs text-muted-foreground">
            Status: {SEARCH_STATUS_LABELS[status]}
            {range && ` · rozpiętość: ${formatTrlRange(range)}`}
            {search.webSearches != null && ` · wyszukań: ${search.webSearches}`}
            {search.inputTokens != null &&
              ` · tokeny: ${search.inputTokens} wej. / ${search.outputTokens ?? 0} wyj.`}
          </p>
        </div>
        {status === "DONE" && search.results.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
            Agent nie znalazł pasujących wyników w wybranych źródłach.
          </p>
        ) : search.results.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
            Do tego aspektu nie zapisano listy wyników.
          </p>
        ) : (
          <ResultList items={search.results} />
        )}
      </section>
    </div>
  );
}
