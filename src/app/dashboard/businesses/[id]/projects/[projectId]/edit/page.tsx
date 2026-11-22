import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeedForm } from "@/components/need/need-form";
import { PageHeader } from "@/components/page-header";
import { getMyNeed } from "@/queries/need";

export const metadata: Metadata = { title: "Edycja projektu" };

export default async function EditNeedPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/projects/[projectId]/edit">) {
  const { id, projectId } = await params;
  const need = await getMyNeed(projectId, id);
  if (!need) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edytuj" accent="projekt" />
      <NeedForm businessId={id} need={need} />
    </div>
  );
}
