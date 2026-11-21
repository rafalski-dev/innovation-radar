import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NeedForm } from "@/components/need/need-form";
import { PageHeader } from "@/components/page-header";
import { getMyNeed } from "@/queries/need";

export const metadata: Metadata = { title: "Edycja potrzeby" };

export default async function EditNeedPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/needs/[needId]/edit">) {
  const { id, needId } = await params;
  const need = await getMyNeed(needId, id);
  if (!need) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edytuj potrzebę" />
      <NeedForm businessId={id} need={need} />
    </div>
  );
}
