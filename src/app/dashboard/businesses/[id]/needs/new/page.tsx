import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeedForm } from "@/components/need/need-form";
import { PageHeader } from "@/components/page-header";
import { getMyBusiness } from "@/queries/business";

export const metadata: Metadata = { title: "Nowa potrzeba" };

export default async function NewNeedPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/needs/new">) {
  const { id } = await params;
  const business = await getMyBusiness(id);
  if (!business) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Nowa potrzeba" description={`Organizacja: ${business.name}`} />
      <NeedForm businessId={business.id} />
    </div>
  );
}
