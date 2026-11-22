"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CopyIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteNeed, duplicateNeed } from "@/actions/need";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button, buttonVariants } from "@/components/shadcn/button";
import type { NeedRow } from "@/queries/need";

// Akcje przy projekcie: duplikuj, edytuj, usuń. Po wysłaniu raportu projekt jest zamknięty
// do edycji i usuwania, zostaje tylko duplikowanie.
export function NeedRowActions({ need }: { need: NeedRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function duplicate() {
    startTransition(async () => {
      const result = await duplicateNeed(need.id);
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
      {!need.sentAt && (
        <>
          <Link
            href={`/dashboard/businesses/${need.businessId}/projects/${need.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <PencilIcon />
            <span className="sr-only">Edytuj</span>
          </Link>
          <ConfirmDeleteButton itemName={need.title} onConfirm={() => deleteNeed(need.id)} />
        </>
      )}
    </div>
  );
}
