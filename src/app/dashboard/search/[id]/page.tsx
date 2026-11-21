import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResultList } from "@/components/search/result-list";
import { buttonVariants } from "@/components/shadcn/button";
import { getSearch } from "@/queries/search";
import { SEARCH_STATUS_LABELS, phrasesSchema, type SearchStatusValue } from "@/validation/search";

export const metadata: Metadata = { title: "Wyszukiwanie" };

export default async function SearchDetailPage({ params }: PageProps<"/dashboard/search/[id]">) {
  const { id } = await params;
  const search = await getSearch(id);
  if (!search) notFound();

  const phrases = phrasesSchema.safeParse(search.phrases);
  const phraseList = phrases.success ? phrases.data : [];
  const status = search.status as SearchStatusValue;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/search" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeftIcon />
        Wszystkie wyszukiwania
      </Link>
      <PageHeader
        title={search.need?.title ?? "Wyszukiwanie"}
        description={search.need ? search.need.business.name : search.query}
      />

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Frazy</h2>
        {phraseList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            To wyszukiwanie nie ma zapisanych fraz. Utwórz nowe z wygenerowanymi frazami.
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
          <h2 className="text-sm font-medium">Wyniki agenta</h2>
          <p className="text-xs text-muted-foreground">
            Status: {SEARCH_STATUS_LABELS[status]}
            {search.webSearches != null && ` · wyszukań: ${search.webSearches}`}
            {search.inputTokens != null &&
              ` · tokeny: ${search.inputTokens} wej. / ${search.outputTokens ?? 0} wyj.`}
          </p>
        </div>
        {status === "DONE" && search.results.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Agent nie znalazł pasujących wyników w wybranych źródłach.
          </p>
        ) : search.results.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Do tego wyszukiwania nie zapisano listy wyników.
          </p>
        ) : (
          <ResultList items={search.results} />
        )}
      </section>
    </div>
  );
}
