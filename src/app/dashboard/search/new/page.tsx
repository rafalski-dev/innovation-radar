import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search/search-form";
import { getMyNeeds } from "@/queries/need";

export const metadata: Metadata = { title: "Nowy aspekt" };

export default async function NewSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const [needs, { need }] = await Promise.all([getMyNeeds(), searchParams]);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Nowy aspekt"
        description="Opisz, czego szukasz. Agent przeszuka patenty, publikacje i projekty (UPRP, EPO, PBN, Interreg, NCBiR) i uzasadni dopasowanie."
      />
      <SearchForm
        initialNeedId={need}
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
