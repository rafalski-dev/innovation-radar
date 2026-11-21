"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { deleteNeed } from "@/actions/need";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { buttonVariants } from "@/components/shadcn/button";
import type { NeedRow } from "@/queries/need";

export function NeedRowActions({ need }: { need: NeedRow }) {
  return (
    <div className="flex gap-1">
      <Link
        href={`/dashboard/businesses/${need.businessId}/needs/${need.id}/edit`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <PencilIcon />
        <span className="sr-only">Edytuj</span>
      </Link>
      <ConfirmDeleteButton itemName={need.title} onConfirm={() => deleteNeed(need.id)} />
    </div>
  );
}
