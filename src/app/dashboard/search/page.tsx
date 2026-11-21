import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search/search-form";
import { getMyNeeds } from "@/queries/need";

export const metadata: Metadata = { title: "Wyszukiwanie" };

export default async function SearchPage() {
  const needs = await getMyNeeds();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Wyszukiwanie"
        description="Opisz, czego szukasz. Agent przeszuka patenty, publikacje i projekty (UPRP, EPO, PBN, Interreg, NCBiR) i uzasadni dopasowanie."
      />
      <SearchForm
        needs={needs.map((n) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          businessName: n.business.name,
        }))}
      />
      <section className="space-y-2">
        <h2 className="text-lg font-medium">Wyniki</h2>
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Tu pojawią się dopasowane wyniki z uzasadnieniem i historia Twoich wyszukiwań.
        </p>
      </section>
    </div>
  );
}
