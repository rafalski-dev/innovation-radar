"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CopyIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { copySearch, deleteSearch } from "@/actions/search";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Button, buttonVariants } from "@/components/shadcn/button";

// Akcje przy aspekcie (tak samo jak przy projekcie): kopiuj, edytuj, usuń.
// Po wysłaniu raportu projekt jest zamknięty (`canChange` = false), więc zostaje tylko ikona usuwania,
// którą serwer i tak odrzuci z komunikatem.
export function SearchRowActions({
  id,
  name,
  canChange,
  redirectAfterDelete,
}: {
  id: string;
  name: string;
  canChange: boolean;
  redirectAfterDelete?: string; // gdzie przejść po usunięciu (strona aspektu)
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function copy() {
    startTransition(async () => {
      const result = await copySearch(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Skopiowano aspekt (kopię znajdziesz na liście, możesz ją edytować)");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      {canChange && (
        <>
          <Button variant="ghost" size="icon-sm" onClick={copy} disabled={pending}>
            <CopyIcon />
            <span className="sr-only">Kopiuj aspekt</span>
          </Button>
          <Link
            href={`/dashboard/search/${id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <PencilIcon />
            <span className="sr-only">Edytuj aspekt</span>
          </Link>
        </>
      )}
      <ConfirmDeleteButton
        itemName={name}
        onConfirm={() => deleteSearch(id)}
        onDeleted={redirectAfterDelete ? () => router.push(redirectAfterDelete) : undefined}
      />
    </div>
  );
}
