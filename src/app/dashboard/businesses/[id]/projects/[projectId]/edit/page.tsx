import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/project/project-form";
import { PageHeader } from "@/components/page-header";
import { getMyProject } from "@/queries/project";

export const metadata: Metadata = { title: "Edycja projektu" };

export default async function EditProjectPage({
  params,
}: PageProps<"/dashboard/businesses/[id]/projects/[projectId]/edit">) {
  const { id, projectId } = await params;
  const project = await getMyProject(projectId, id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edytuj" accent="projekt" />
      <ProjectForm businessId={id} project={project} />
    </div>
  );
}
