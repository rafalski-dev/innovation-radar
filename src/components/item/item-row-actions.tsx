"use client";

import { PencilIcon } from "lucide-react";
import { deleteItem } from "@/actions/item";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { ItemForm } from "@/components/item/item-form";
import { Button } from "@/components/shadcn/button";
import type { ItemRow } from "@/queries/item";

export function ItemRowActions({ item }: { item: ItemRow }) {
  return (
    <div className="flex justify-end gap-1">
      <ItemForm
        item={item}
        trigger={
          <Button variant="ghost" size="icon-sm">
            <PencilIcon />
            <span className="sr-only">Edytuj</span>
          </Button>
        }
      />
      <ConfirmDeleteButton itemName={item.name} onConfirm={() => deleteItem(item.id)} />
    </div>
  );
}
