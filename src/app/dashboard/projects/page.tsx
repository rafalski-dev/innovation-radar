import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, FileTextIcon, LockIcon, PlusIcon } from "lucide-react";
import { ProjectFilters } from "@/components/project/project-filters";
import { ProjectStats } from "@/components/project/project-stats";
import { SendReportButton } from "@/components/project/send-report-button";
import { Badge } from "@/components/shadcn/badge";
import { projectNumber } from "@/lib/numbering";
import { formatTrlRange, trlRange } from "@/lib/trl";
import { ProjectAttachments } from "@/components/project/project-attachments";
import { ProjectRowActions } from "@/components/project/project-row-actions";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyProjects } from "@/queries/project";

export const metadata: Metadata = { title: "Projekty" };

type SearchParams = Promise<{ q?: string; org?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", org = "" } = await searchParams;
  const all = await getMyProjects();
  const organizations = [
    ...new Map(all.map((n) => [n.business.id, n.business.name])).entries(),
  ].map(([id, name]) => ({ id, name }));

  const term = q.trim().toLowerCase();
  const projects = all.filter((project) => {
    if (org && project.business.id !== org) return false;
    if (!term) return true;
    const haystack = [
      project.title,
      project.description,
      project.business.name,
      project.author?.email ?? project.business.owner.email,
      ...project.searches.map((s) => s.user.email),
      ...project.searches.flatMap((s) => s.results.map((r) => r.sourceName)),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        accent="Projekty"
        description="Lista projektów ze wszystkich Twoich organizacji. Na ich podstawie agent wyszuka patenty i rozwiązania problemów."
        action={
          <Link href="/dashboard/projects/new" className={buttonVariants()}>
            <PlusIcon />
            Nowy projekt
          </Link>
        }
      />
      {all.length > 0 && <ProjectFilters organizations={organizations} />}
      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          {all.length === 0
            ? "Nie masz jeszcze żadnego projektu. Dodaj pierwszą przyciskiem „Nowy projekt”."
            : "Brak projektów spełniających kryteria wyszukiwania."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {projects.map((project) => {
            const results = project.searches.flatMap((s) => s.results);
            const range = trlRange(results.map((r) => r.trl));
            const sources = [...new Set(results.map((r) => r.sourceName))].sort((a, b) =>
              a.localeCompare(b, "pl"),
            );
            const aspectAuthors = [...new Set(project.searches.map((s) => s.user.email))];
            const details: [string, string][] = [
              ["Autor projektu", project.author?.email ?? project.business.owner.email],
              ["Autorzy aspektów", aspectAuthors.length > 0 ? aspectAuthors.join(", ") : "—"],
              ["Użyte bazy", sources.length > 0 ? sources.join(", ") : "—"],
              ["Rozpiętość TRL", range ? formatTrlRange(range) : "—"],
            ];
            return (
              <li key={project.id} className="rounded-2xl border bg-card">
                <div className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      {projectNumber(project.createdAt)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{project.title}</span>
                      {project.sentAt && (
                        <Badge variant="secondary" className="gap-1">
                          <LockIcon className="size-3" />
                          Raport wysłany
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <dl className="space-y-0.5 pt-1 text-xs">
                      {details.map(([label, value]) => (
                        <div key={label} className="flex flex-wrap gap-x-1">
                          <dt className="text-muted-foreground">{label}:</dt>
                          <dd className="font-medium break-all">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <ProjectAttachments project={project} />
                    <Link
                      href={`/dashboard/businesses?org=${project.business.id}`}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                    >
                      <BuildingIcon className="size-3" />
                      {project.business.name}
                    </Link>
                  </div>
                  <ProjectRowActions project={project} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                  <ProjectStats project={project} />
                  <div className="flex flex-wrap items-center gap-2">
                    {project.searches.length > 0 && (
                      <>
                        <a
                          href={`/api/projects/${project.id}/report`}
                          download
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <FileTextIcon />
                          Pobierz raport (PDF)
                        </a>
                        {!project.sentAt && (
                          <SendReportButton projectId={project.id} title={project.title} />
                        )}
                      </>
                    )}
                    {!project.sentAt && (
                      <Link
                        href={`/dashboard/search/new?project=${project.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <PlusIcon />
                        Dodaj aspekt
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
