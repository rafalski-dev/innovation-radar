"use client";

import { PencilIcon } from "lucide-react";
import { deleteInnovation } from "@/actions/innovation";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { InnovationForm } from "@/components/innovation/innovation-form";
import { Button } from "@/components/shadcn/button";
import type { InnovationRow } from "@/queries/innovation";

// Edycja i usuwanie tylko w statusie „Zgłoszone” (akcje i tak to sprawdzają na serwerze).
export function InnovationRowActions({
  innovation,
  teams,
}: {
  innovation: InnovationRow;
  teams: { id: string; name: string }[];
}) {
  if (innovation.status !== "SUBMITTED") return null;

  return (
    <div className="flex justify-end gap-1">
      <InnovationForm
        innovation={innovation}
        teams={teams}
        trigger={
          <Button variant="ghost" size="icon-sm">
            <PencilIcon />
            <span className="sr-only">Edytuj</span>
          </Button>
        }
      />
      <ConfirmDeleteButton
        itemName={innovation.title}
        onConfirm={() => deleteInnovation(innovation.id)}
      />
    </div>
  );
}
