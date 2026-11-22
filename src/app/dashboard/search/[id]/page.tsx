import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileTextIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResultList } from "@/components/search/result-list";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel } from "@/lib/numbering";
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
  const label = aspectLabel(search.number, search.need?.createdAt);
  const closed = !!search.need?.sentAt;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeftIcon />
        Wszystkie aspekty
      </Link>
      <PageHeader
        title={search.need?.title ?? "Aspekt"}
        description={[label, search.need ? search.need.business.name : search.query]
          .filter(Boolean)
          .join(" · ")}
      />

      {search.need && (
        <div className="flex flex-wrap gap-2">
          {closed ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Raport projektu został wysłany, więc nie można dodawać kolejnych aspektów.
            </p>
          ) : (
            <Link
              href={`/dashboard/search/new?need=${search.need.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <PlusIcon />
              Dodaj kolejny aspekt
            </Link>
          )}
          <Link href={`/dashboard/projects/${search.need.id}/report`} className={buttonVariants()}>
            <FileTextIcon />
            Wygeneruj zbiorcze opracowanie projektu (PDF)
          </Link>
        </div>
      )}

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
