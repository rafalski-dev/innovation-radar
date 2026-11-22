import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SearchList } from "@/components/search/search-list";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel, aspectTitle } from "@/lib/numbering";
import { trlRange } from "@/lib/trl";
import { getMySearches } from "@/queries/search";
import { phrasesSchema } from "@/validation/search";

export const metadata: Metadata = { title: "Aspekty" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function SearchesPage() {
  const searches = await getMySearches();

  return (
    <div className="space-y-6">
      <PageHeader
        accent="Aspekty"
        description="Aspekty Twoich projektów: frazy, użyte bazy, wyszukiwania i rozpiętość TRL wraz z autorem."
        action={
          <Link href="/dashboard/search/new" className={buttonVariants()}>
            <PlusIcon />
            Nowy aspekt
          </Link>
        }
      />
      {searches.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnego aspektu. Dodaj pierwszy przyciskiem „Nowy aspekt”.
        </p>
      ) : (
        <SearchList
          rows={searches.map((s) => {
            const phrases = phrasesSchema.safeParse(s.phrases);
            const range = s.results.length > 0 ? trlRange(s.results.map((r) => r.trl)) : null;
            return {
              id: s.id,
              title: aspectTitle(s.title, s.number),
              query: s.query,
              label: aspectLabel(s.number, s.project?.createdAt),
              isMine: s.isMine,
              // kopiować i edytować może autor aspektu z projektem, który nie jest zamknięty
              canChange: s.isMine && !!s.project && !s.project.sentAt,
              createdAt: s.createdAt.toISOString(),
              createdLabel: dateFormat.format(s.createdAt),
              projectId: s.project?.id ?? null,
              projectTitle: s.project?.title ?? null,
              businessName: s.project?.business.name ?? null,
              phrases: phrases.success ? phrases.data : [],
              sources: [...new Set(s.results.map((r) => r.sourceName))].sort((x, y) =>
                x.localeCompare(y, "pl"),
              ),
              searchesCount: s.results.length,
              trlMin: range?.min ?? null,
              trlMax: range?.max ?? null,
              authorEmail: s.user.email,
            };
          })}
        />
      )}
    </div>
  );
}
