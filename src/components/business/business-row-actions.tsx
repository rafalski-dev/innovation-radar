"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { deleteBusiness } from "@/actions/business";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { buttonVariants } from "@/components/shadcn/button";
import type { BusinessRow } from "@/queries/business";

export function BusinessRowActions({ business }: { business: BusinessRow }) {
  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/dashboard/businesses/${business.id}/edit`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <PencilIcon />
        <span className="sr-only">Edytuj</span>
      </Link>
      <ConfirmDeleteButton itemName={business.name} onConfirm={() => deleteBusiness(business.id)} />
    </div>
  );
}
