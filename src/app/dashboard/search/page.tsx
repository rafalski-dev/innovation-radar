import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMySearches } from "@/queries/search";

export const metadata: Metadata = { title: "Wyszukiwania" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function SearchesPage() {
  const searches = await getMySearches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wyszukiwania"
        description="Historia Twoich wyszukiwań. Agent przeszuka patenty, publikacje i projekty (UPRP, EPO, PBN, Interreg, NCBiR) i uzasadni dopasowanie."
        action={
          <Link href="/dashboard/search/new" className={buttonVariants()}>
            <PlusIcon />
            Nowe wyszukiwanie
          </Link>
        }
      />
      {searches.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnego wyszukiwania. Dodaj pierwsze przyciskiem „Nowe wyszukiwanie”.
        </p>
      ) : (
        <ul className="grid gap-3">
          {searches.map((s) => (
            <li key={s.id} className="space-y-1 rounded-lg border p-4">
              <p className="line-clamp-3 text-sm">{s.query}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <time dateTime={s.createdAt.toISOString()}>{dateFormat.format(s.createdAt)}</time>
                {s.need && (
                  <span className="inline-flex items-center gap-1">
                    <BuildingIcon className="size-3" />
                    {s.need.title} · {s.need.business.name}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
