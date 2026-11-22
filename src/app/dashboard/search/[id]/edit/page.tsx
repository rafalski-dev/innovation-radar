import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search/search-form";
import { aspectLabel, aspectTitle } from "@/lib/numbering";
import { getMyProjects } from "@/queries/project";
import { getSearch } from "@/queries/search";
import { getActiveSources } from "@/queries/source";
import { phrasesSchema } from "@/validation/search";

export const metadata: Metadata = { title: "Edycja aspektu" };

// Edycja zapisanego aspektu (tytuł, frazy, wyniki). Tylko aspekty z projektem, który nie jest zamknięty.
export default async function EditSearchPage({ params }: PageProps<"/dashboard/search/[id]/edit">) {
  const { id } = await params;
  const [projects, sourceOptions, search] = await Promise.all([
    getMyProjects(),
    getActiveSources(),
    getSearch(id),
  ]);
  if (!search?.project) notFound();
  if (search.project.sentAt) redirect(`/dashboard/search/${search.id}`);
  const phrases = phrasesSchema.safeParse(search.phrases);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edytuj"
        accent="aspekt"
        description={aspectTitle(search.title, search.number)}
      />
      <SearchForm
        sourceOptions={sourceOptions}
        projects={projects.map((n) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          businessName: n.business.name,
        }))}
        editing={{
          id: search.id,
          label: aspectLabel(search.number, search.project.createdAt),
          title: search.title ?? "",
          query: search.query,
          phrases: phrases.success ? phrases.data : [],
          projectId: search.project.id,
          projectTitle: search.project.title,
          results: search.results.map((r) => ({
            title: r.title,
            summary: r.summary,
            organization: r.organization ?? "",
            sourceName: r.sourceName,
            sourceUrl: r.sourceUrl,
            why: r.why,
            trl: r.trl,
          })),
        }}
      />
    </div>
  );
}
