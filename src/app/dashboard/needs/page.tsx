import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, PlusIcon } from "lucide-react";
import { NeedAttachments } from "@/components/need/need-attachments";
import { NeedRowActions } from "@/components/need/need-row-actions";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyNeeds } from "@/queries/need";

export const metadata: Metadata = { title: "Potrzeby" };

export default async function NeedsPage() {
  const needs = await getMyNeeds();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Potrzeby"
        description="Lista potrzeb ze wszystkich Twoich organizacji. Na ich podstawie agent wyszuka patenty i rozwiązania problemów."
        action={
          <Link href="/dashboard/needs/new" className={buttonVariants()}>
            <PlusIcon />
            Nowa potrzeba
          </Link>
        }
      />
      {needs.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnej potrzeby. Dodaj pierwszą przyciskiem „Nowa potrzeba”.
        </p>
      ) : (
        <ul className="grid gap-3">
          {needs.map((need) => (
            <li
              key={need.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
