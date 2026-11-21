import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { NeedRowActions } from "@/components/need/need-row-actions";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyBusiness } from "@/queries/business";
import { getNeedsForBusiness } from "@/queries/need";

export const metadata: Metadata = { title: "Organizacja" };

export default async function BusinessPage({ params }: PageProps<"/dashboard/businesses/[id]">) {
  const { id } = await params;
  const business = await getMyBusiness(id);
  if (!business) notFound();
  const needs = await getNeedsForBusiness(id);

  const details = [business.industry, business.city].filter(Boolean).join(" · ");
  const address = [business.street, [business.postalCode, business.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/businesses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Moje organizacje
      </Link>
      <PageHeader title={business.name} description={details || undefined} />
      {(business.nip || address) && (
        <dl className="grid max-w-2xl gap-1 text-sm sm:grid-cols-[6rem_1fr]">
          {business.nip && (
            <>
              <dt className="text-muted-foreground">NIP</dt>
              <dd>{business.nip}</dd>
            </>
          )}
          {address && (
            <>
              <dt className="text-muted-foreground">Adres</dt>
              <dd>{address}</dd>
            </>
          )}
        </dl>
      )}
      {business.description && <p className="max-w-2xl text-sm">{business.description}</p>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Potrzeby</h2>
          <Link
            href={`/dashboard/businesses/${business.id}/needs/new`}
            className={buttonVariants({ size: "sm" })}
          >
            <PlusIcon />
            Nowa potrzeba
          </Link>
        </div>

        {needs.length === 0 ? (
          <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            Ta organizacja nie ma jeszcze żadnej potrzeby. Opisz pierwszą.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {needs.map((need) => (
              <li key={need.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="font-medium">{need.title}</div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {need.expectedOutcome}
                  </p>
                </div>
                <NeedRowActions need={need} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
