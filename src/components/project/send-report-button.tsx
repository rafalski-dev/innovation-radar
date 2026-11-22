"use client";

import { useState, useTransition } from "react";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { sendProjectReport } from "@/actions/project";
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

// Wysyła raport do właściciela i członków organizacji. To zamyka projekt do edycji (po potwierdzeniu).
export function SendReportButton({
  projectId,
  title,
  size = "sm",
}: {
  projectId: string;
  title: string;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await sendProjectReport(projectId);
      if (result.success) {
        toast.success("Wysłano raport do członków organizacji. Projekt jest zamknięty do edycji");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size={size} />}>
        <SendIcon />
        Wyślij raport
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wysłać raport projektu „{title}”?</DialogTitle>
          <DialogDescription>
            Raport trafi e-mailem do wszystkich członków organizacji. Po wysłaniu nie będzie można
            edytować ani usuwać projektu ani dodawać do niego aspektów. Tej operacji nie można
            cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Anuluj</DialogClose>
          <Button onClick={confirm} disabled={pending}>
            {pending ? "Wysyłanie…" : "Wyślij i zamknij projekt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
