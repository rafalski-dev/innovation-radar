import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, FileTextIcon, LockIcon, PlusIcon } from "lucide-react";
import { NeedStats } from "@/components/need/need-stats";
import { SendReportButton } from "@/components/need/send-report-button";
import { Badge } from "@/components/shadcn/badge";
import { projectNumber } from "@/lib/numbering";
import { NeedAttachments } from "@/components/need/need-attachments";
import { NeedRowActions } from "@/components/need/need-row-actions";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyNeeds } from "@/queries/need";

export const metadata: Metadata = { title: "Projekty" };

export default async function NeedsPage() {
  const needs = await getMyNeeds();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projekty"
        description="Lista projektów ze wszystkich Twoich organizacji. Na ich podstawie agent wyszuka patenty i rozwiązania problemów."
        action={
          <Link href="/dashboard/projects/new" className={buttonVariants()}>
            <PlusIcon />
            Nowy projekt
          </Link>
        }
      />
      {needs.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnego projektu. Dodaj pierwszą przyciskiem „Nowy projekt”.
        </p>
      ) : (
        <ul className="grid gap-3">
          {needs.map((need) => (
            <li key={need.id} className="rounded-lg border">
              <div className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-xs text-muted-foreground">
                    {projectNumber(need.createdAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{need.title}</span>
                    {need.sentAt && (
                      <Badge variant="secondary" className="gap-1">
                        <LockIcon className="size-3" />
                        Raport wysłany
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{need.description}</p>
                  <NeedAttachments need={need} />
                  <Link
                    href={`/dashboard/businesses?org=${need.business.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                  >
                    <BuildingIcon className="size-3" />
                    {need.business.name}
                  </Link>
                </div>
                <NeedRowActions need={need} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                <NeedStats need={need} />
                <div className="flex flex-wrap items-center gap-2">
                  {need.searches.length > 0 && (
                    <>
                      <Link
                        href={`/dashboard/projects/${need.id}/report`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <FileTextIcon />
                        Raport (PDF)
                      </Link>
                      {!need.sentAt && <SendReportButton needId={need.id} title={need.title} />}
                    </>
                  )}
                  {!need.sentAt && (
                    <Link
                      href={`/dashboard/search/new?need=${need.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <PlusIcon />
                      Dodaj aspekt
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
