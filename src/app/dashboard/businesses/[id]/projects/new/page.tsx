import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/project/project-form";
import { PageHeader } from "@/components/page-header";
import { getAccessibleBusiness } from "@/queries/business";

export const metadata: Metadata = { title: "Nowy projekt" };

export default async function NewProjectPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/projects/new">) {
  const { id } = await params;
  const business = await getAccessibleBusiness(id);
  if (!business) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Nowy" accent="projekt" description={`Organizacja: ${business.name}`} />
      <ProjectForm businessId={business.id} />
    </div>
  );
}
