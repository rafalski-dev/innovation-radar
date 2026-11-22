"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import type { ActionResult } from "@/lib/action-result";

type ConfirmDeleteButtonProps = {
  itemName: string;
  onConfirm: () => Promise<ActionResult>;
  // ikona przycisku (domyślnie kosz)
  icon?: React.ReactNode;
  // tekst obok ikony (np. „Usuń”); bez niego przycisk jest samą ikoną
  label?: string;
  // po udanym usunięciu (np. przejście na listę)
  onDeleted?: () => void;
};

export function ConfirmDeleteButton({
  itemName,
  onConfirm,
  icon,
  label,
  onDeleted,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.success) {
        toast.success(`Usunięto „${itemName}”`);
        setOpen(false);
        onDeleted?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={label ? <Button variant="outline" /> : <Button variant="ghost" size="icon-sm" />}
      >
        {icon ?? <Trash2Icon />}
        {label ?? <span className="sr-only">Usuń</span>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć „{itemName}”?</DialogTitle>
          <DialogDescription>Tej operacji nie można cofnąć.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Anuluj</DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "Usuwanie…" : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
