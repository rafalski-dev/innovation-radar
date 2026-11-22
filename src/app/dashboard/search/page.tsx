import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SearchList } from "@/components/search/search-list";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel } from "@/lib/numbering";
import { getMySearches } from "@/queries/search";

export const metadata: Metadata = { title: "Aspekty" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function SearchesPage() {
  const searches = await getMySearches();

  return (
    <div className="space-y-6">
      <PageHeader
        accent="Aspekty"
        description="Historia Twoich aspektów: frazy, źródła i wyniki znalezione przez agenta wraz z uzasadnieniem dopasowania."
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
          rows={searches.map((s) => ({
            id: s.id,
            title: s.title,
            query: s.query,
            label: aspectLabel(s.number, s.project?.createdAt),
            canChange: !!s.project && !s.project.sentAt, // kopiować i edytować można aspekt z projektem, który nie jest zamknięty
            createdAt: s.createdAt.toISOString(),
            createdLabel: dateFormat.format(s.createdAt),
            projectId: s.project?.id ?? null,
            projectTitle: s.project?.title ?? null,
            businessName: s.project?.business.name ?? null,
            resultsCount: s._count.results,
          }))}
        />
      )}
    </div>
  );
}
