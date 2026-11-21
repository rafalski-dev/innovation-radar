import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { TypeBadge } from "@/components/innovation/type-badge";
import { Badge } from "@/components/shadcn/badge";
import { getInnovationByNumber } from "@/queries/innovation";
import {
  innovationKey,
  innovationSectorLabels,
  innovationSourceLabels,
  innovationStageLabels,
  innovationStatusLabels,
} from "@/validation/innovation";

export const metadata: Metadata = { title: "Szczegóły pomysłu" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <p className="text-sm whitespace-pre-line">{children}</p>
    </section>
  );
}

export default async function InnovationDetailPage({ params }: PageProps<"/dashboard/[number]">) {
  const { number: raw } = await params;
  const number = Number(raw);
  if (!Number.isInteger(number)) notFound();

  const innovation = await getInnovationByNumber(number);
  if (!innovation) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Wróć do dashboardu
      </Link>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">{innovationKey(innovation.number)}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{innovation.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge>{innovationStatusLabels[innovation.status]}</Badge>
          <TypeBadge type={innovation.type} />
          <Badge variant="outline">{innovationStageLabels[innovation.stage]}</Badge>
          {innovation.sector && (
            <Badge variant="outline">{innovationSectorLabels[innovation.sector]}</Badge>
          )}
        </div>
      </div>

      <Section title="Streszczenie">{innovation.summary}</Section>
      <Section title="Problem">{innovation.problem}</Section>
      <Section title="Rozwiązanie">{innovation.solution}</Section>
      {innovation.creators && <Section title="Twórcy">{innovation.creators}</Section>}
      {innovation.contactEmail && <Section title="Kontakt">{innovation.contactEmail}</Section>}
      {innovation.sourceUrl && <Section title="Źródło">{innovation.sourceUrl}</Section>}

      <p className="border-t pt-4 text-xs text-muted-foreground">
        Zgłoszono {dateFormat.format(innovation.createdAt)} · pochodzenie:{" "}
        {innovationSourceLabels[innovation.source]}
      </p>
    </div>
  );
}
