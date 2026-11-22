import type { Metadata } from "next";
import Link from "next/link";
import { NeedForm } from "@/components/need/need-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyBusinesses } from "@/queries/business";

export const metadata: Metadata = { title: "Nowy projekt" };

export default async function NewNeedPage() {
  const businesses = await getMyBusinesses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nowy"
        accent="projekt"
        description="Wybierz organizację i opisz, czego szukasz."
      />
      {businesses.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          <p>Projekt należy do organizacji. Najpierw dodaj swoją pierwszą organizację.</p>
          <Link href="/dashboard/businesses/new" className={buttonVariants({ size: "sm" })}>
            Nowa organizacja
          </Link>
        </div>
      ) : (
        <NeedForm
          businesses={businesses.map((b) => ({ id: b.id, name: b.name, city: b.city, nip: b.nip }))}
        />
      )}
    </div>
  );
}
