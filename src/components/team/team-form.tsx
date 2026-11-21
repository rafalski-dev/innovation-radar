"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTeam } from "@/actions/team";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { type TeamInput, teamSchema } from "@/validation/team";

export function TeamForm({ trigger }: { trigger: React.ReactElement }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: TeamInput) {
    startTransition(async () => {
      const result = await createTeam(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Utworzono zespół");
      setOpen(false);
      form.reset();
      router.push(`/dashboard/teams/${result.data}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nowy zespół</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField label="Nazwa zespołu" htmlFor="team-name" error={errors.name?.message}>
            <Input id="team-name" aria-invalid={!!errors.name} {...form.register("name")} />
          </FormField>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Anuluj</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Zapisywanie…" : "Utwórz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
