"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CopyIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteProject, duplicateProject } from "@/actions/project";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button, buttonVariants } from "@/components/shadcn/button";
import type { ProjectRow } from "@/queries/project";

// Akcje przy projekcie: duplikuj, edytuj, usuń. Po wysłaniu raportu projekt jest zamknięty
// do edycji i usuwania, zostaje tylko duplikowanie.
export function ProjectRowActions({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function duplicate() {
    startTransition(async () => {
      const result = await duplicateProject(project.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Zduplikowano projekt (bez aspektów i plików PDF)");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon-sm" onClick={duplicate} disabled={pending}>
        <CopyIcon />
        <span className="sr-only">Duplikuj projekt</span>
      </Button>
      {!project.sentAt && (
        <>
          <Link
            href={`/dashboard/businesses/${project.businessId}/projects/${project.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <PencilIcon />
            <span className="sr-only">Edytuj</span>
          </Link>
          <ConfirmDeleteButton
            itemName={project.title}
            onConfirm={() => deleteProject(project.id)}
          />
        </>
      )}
    </div>
  );
}
