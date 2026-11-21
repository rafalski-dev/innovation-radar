"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createInnovation, updateInnovation } from "@/actions/innovation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { InnovationRow } from "@/queries/innovation";
import { Textarea } from "@/components/shadcn/textarea";
import {
  INNOVATION_SECTORS,
  INNOVATION_STAGES,
  INNOVATION_TYPES,
  type InnovationInput,
  NO_SECTOR,
  NO_TEAM,
  innovationKey,
  innovationSchema,
  innovationSectorLabels,
  innovationStageLabels,
  innovationTypeLabels,
} from "@/validation/innovation";

function toDefaults(innovation?: InnovationRow): InnovationInput {
  return {
    title: innovation?.title ?? "",
    summary: innovation?.summary ?? "",
    problem: innovation?.problem ?? "",
    solution: innovation?.solution ?? "",
    type: innovation?.type ?? "TECHNOLOGICAL",
    stage: innovation?.stage ?? "IDEA",
    sector: innovation?.sector ?? NO_SECTOR,
    teamId: innovation?.teamId ?? NO_TEAM,
    sourceUrl: innovation?.sourceUrl ?? "",
    creators: innovation?.creators ?? "",
    contactEmail: innovation?.contactEmail ?? "",
  };
}

const sectorItems = { [NO_SECTOR]: "Brak", ...innovationSectorLabels };

type InnovationFormProps = {
  // brak = dodawanie, jest = edycja
  innovation?: InnovationRow;
  teams: { id: string; name: string }[];
  trigger: React.ReactElement;
};

export function InnovationForm({ innovation, teams, trigger }: InnovationFormProps) {
  const isEdit = Boolean(innovation);
  const teamItems = {
    [NO_TEAM]: "Brak (tylko ja)",
    ...Object.fromEntries(teams.map((t) => [t.id, t.name])),
  };
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<InnovationInput>({
    resolver: zodResolver(innovationSchema),
    defaultValues: toDefaults(innovation),
  });
  const { errors } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toDefaults(innovation));
  }

  function onSubmit(values: InnovationInput) {
    startTransition(async () => {
      const result = innovation
        ? await updateInnovation(innovation.id, values)
        : await createInnovation(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        innovation ? "Zapisano zmiany" : `Zgłoszono pomysł ${innovationKey(Number(result.data))}`,
      );
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edytuj pomysł" : "Nowy pomysł"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField label="Tytuł" htmlFor="title" error={errors.title?.message}>
            <Input id="title" aria-invalid={!!errors.title} {...form.register("title")} />
          </FormField>

          <FormField
            label="Streszczenie (1–3 zdania)"
            htmlFor="summary"
            error={errors.summary?.message}
          >
            <Textarea
              id="summary"
              rows={2}
              aria-invalid={!!errors.summary}
              {...form.register("summary")}
            />
          </FormField>

          <FormField
            label="Problem, który rozwiązuje"
            htmlFor="problem"
            error={errors.problem?.message}
          >
            <Textarea
              id="problem"
              rows={3}
              aria-invalid={!!errors.problem}
              {...form.register("problem")}
            />
          </FormField>

          <FormField
            label="Na czym polega rozwiązanie"
            htmlFor="solution"
            error={errors.solution?.message}
          >
            <Textarea
              id="solution"
              rows={3}
              aria-invalid={!!errors.solution}
              {...form.register("solution")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Typ" error={errors.type?.message}>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select
                    items={innovationTypeLabels}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full" aria-invalid={!!errors.type}>
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      {INNOVATION_TYPES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {innovationTypeLabels[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Etap" error={errors.stage?.message}>
              <Controller
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <Select
                    items={innovationStageLabels}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full" aria-invalid={!!errors.stage}>
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      {INNOVATION_STAGES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {innovationStageLabels[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Sektor (opcjonalnie)" error={errors.sector?.message}>
              <Controller
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <Select
                    items={sectorItems}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SECTOR}>Brak</SelectItem>
                      {INNOVATION_SECTORS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {innovationSectorLabels[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          {teams.length > 0 && (
            <FormField label="Zespół (opcjonalnie)">
              <Controller
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <Select
                    items={teamItems}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TEAM}>Brak (tylko ja)</SelectItem>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          )}

          <FormField
            label="Twórcy (opcjonalnie)"
            htmlFor="creators"
            error={errors.creators?.message}
          >
            <Input id="creators" {...form.register("creators")} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Link do źródła (opcjonalnie)"
              htmlFor="sourceUrl"
              error={errors.sourceUrl?.message}
            >
              <Input
                id="sourceUrl"
                placeholder="https://"
                aria-invalid={!!errors.sourceUrl}
                {...form.register("sourceUrl")}
              />
            </FormField>
            <FormField
              label="E-mail kontaktowy (opcjonalnie)"
              htmlFor="contactEmail"
              error={errors.contactEmail?.message}
            >
              <Input
                id="contactEmail"
                type="email"
                aria-invalid={!!errors.contactEmail}
                {...form.register("contactEmail")}
              />
            </FormField>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Anuluj</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Zapisywanie…" : isEdit ? "Zapisz" : "Zgłoś pomysł"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
