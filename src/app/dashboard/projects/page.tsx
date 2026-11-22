import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, PlusIcon } from "lucide-react";
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
                  <div className="font-medium">{need.title}</div>
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
              <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
                <Link
                  href="/dashboard/search"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Wyszukiwania: {need._count.searches}
                </Link>
                <Link
                  href={`/dashboard/search/new?need=${need.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <PlusIcon />
                  Dodaj wyszukiwanie
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
