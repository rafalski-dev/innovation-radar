import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { BusinessPicker } from "@/components/business/business-picker";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { getMyBusinessesWithNeeds } from "@/queries/business";

export const metadata: Metadata = { title: "Moje organizacje" };

export default async function BusinessesPage({ searchParams }: PageProps<"/dashboard/businesses">) {
  const { org } = await searchParams;
  const businesses = await getMyBusinessesWithNeeds();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje"
        accent="organizacje"
        description="Wybierz organizację, aby zobaczyć jej dane i projekty, dla których szukamy rozwiązań."
        action={
          <Link href="/dashboard/businesses/new" className={buttonVariants()}>
            <PlusIcon />
            Nowa organizacja
          </Link>
        }
      />
      <BusinessPicker
        businesses={businesses}
        initialId={typeof org === "string" ? org : undefined}
      />
    </div>
  );
}
