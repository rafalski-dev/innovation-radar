import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search/search-form";
import { getMyNeeds } from "@/queries/need";
import { getActiveSources } from "@/queries/source";

export const metadata: Metadata = { title: "Nowy aspekt" };

export default async function NewSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const [needs, sourceOptions, { need }] = await Promise.all([
    getMyNeeds(),
    getActiveSources(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nowy"
        accent="aspekt"
        description="Wybierz projekt, zatwierdź frazy i źródła, a agent znajdzie pasujące materiały i uzasadni dopasowanie."
      />
      <SearchForm
        initialNeedId={need}
        sourceOptions={sourceOptions}
        needs={needs.map((n) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          businessName: n.business.name,
        }))}
      />
    </div>
  );
}
