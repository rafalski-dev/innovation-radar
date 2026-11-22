import type { Metadata } from "next";
import { MaterialList } from "@/components/material/material-list";
import { PageHeader } from "@/components/page-header";
import { aspectTitle } from "@/lib/numbering";
import { getMyMaterials } from "@/queries/material";
import { phrasesSchema } from "@/validation/search";

export const metadata: Metadata = { title: "Materiały" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function MaterialsPage() {
  const materials = await getMyMaterials();

  return (
    <div className="space-y-6">
      <PageHeader
        accent="Materiały"
        description="Wszystkie zapisane wyniki wyszukiwań (materiały) z kontekstem AI: opisem, uzasadnieniem dopasowania, frazami i linkiem do źródła."
      />
      {materials.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie ma jeszcze zapisanych materiałów. Pojawią się po zatwierdzeniu wyników aspektu.
        </p>
      ) : (
        <MaterialList
          rows={materials.map((m) => {
            const phrases = phrasesSchema.safeParse(m.search.phrases);
            return {
              id: m.id,
              title: m.title,
              summary: m.summary,
              why: m.why,
              organization: m.organization,
              sourceName: m.sourceName,
              sourceUrl: m.sourceUrl,
              trl: m.trl,
              aspectId: m.search.id,
              aspectTitle: aspectTitle(m.search.title, m.search.number),
              phrases: phrases.success ? phrases.data : [],
              projectTitle: m.search.project?.title ?? null,
              authorEmail: m.search.user.email,
              createdAt: m.search.createdAt.toISOString(),
              createdLabel: dateFormat.format(m.search.createdAt),
            };
          })}
        />
      )}
    </div>
  );
}
