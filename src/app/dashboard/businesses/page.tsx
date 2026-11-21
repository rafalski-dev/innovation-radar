import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { BusinessTable } from "@/components/business/business-table";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyBusinesses } from "@/queries/business";

export const metadata: Metadata = { title: "Moje organizacje" };

export default async function BusinessesPage() {
  const businesses = await getMyBusinesses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje organizacje"
        description="Do organizacji przypiszesz potrzeby i zapytania, dla których szukamy rozwiązań."
        action={
          <Link href="/dashboard/businesses/new" className={buttonVariants()}>
            <PlusIcon />
            Nowa organizacja
          </Link>
        }
      />
      <BusinessTable businesses={businesses} />
    </div>
  );
}
