import type { Metadata } from "next";
import Link from "next/link";
import { BuildingIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SearchRowActions } from "@/components/search/search-row-actions";
import { buttonVariants } from "@/components/shadcn/button";
import { getMySearches } from "@/queries/search";

export const metadata: Metadata = { title: "Aspekty" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function SearchesPage() {
  const searches = await getMySearches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aspekty"
        description="Historia Twoich aspektów. Agent przeszuka patenty, publikacje i projekty (UPRP, EPO, PBN, Interreg, NCBiR) i uzasadni dopasowanie."
        action={
          <Link href="/dashboard/search/new" className={buttonVariants()}>
            <PlusIcon />
            Nowy aspekt
          </Link>
        }
      />
      {searches.length === 0 ? (
        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze żadnego aspektu. Dodaj pierwszy przyciskiem „Nowy aspekt”.
        </p>
      ) : (
        <ul className="grid gap-3">
          {searches.map((s) => (
            <li
              key={s.id}
              className="relative flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <Link
                  href={`/dashboard/search/${s.id}`}
                  className="line-clamp-3 block text-sm after:absolute after:inset-0 after:content-['']"
                >
                  {s.query}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={s.createdAt.toISOString()}>{dateFormat.format(s.createdAt)}</time>
                  {s.need && (
                    <span className="inline-flex items-center gap-1">
                      <BuildingIcon className="size-3" />
                      {s.need.title} · {s.need.business.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative z-10">
                <SearchRowActions id={s.id} name={s.need?.title ?? "aspekt"} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
