import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessForm } from "@/components/business/business-form";
import { PageHeader } from "@/components/page-header";
import { getMyBusiness } from "@/queries/business";

export const metadata: Metadata = { title: "Edycja organizacji" };

export default async function EditBusinessPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/edit">) {
  const { id } = await params;
  const business = await getMyBusiness(id);
  if (!business) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edytuj: ${business.name}`} />
      <BusinessForm business={business} />
    </div>
  );
}
