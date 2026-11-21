"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createItem, updateItem } from "@/actions/item";
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
import { Textarea } from "@/components/shadcn/textarea";
import type { ItemRow } from "@/queries/item";
import {
  ITEM_PRIORITIES,
  ITEM_STATUSES,
  type ItemInput,
  itemPriorityLabels,
  itemSchema,
  itemStatusLabels,
} from "@/validation/item";

type ItemFormProps = {
  // brak = dodawanie, jest = edycja
  item?: ItemRow;
  trigger: React.ReactElement;
};

function toDefaults(item?: ItemRow): ItemInput {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    status: item?.status ?? "DRAFT",
    priority: item?.priority ?? "MEDIUM",
  };
}

export function ItemForm({ item, trigger }: ItemFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(item);

  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: toDefaults(item),
  });
  const { errors } = form.formState;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) form.reset(toDefaults(item));
  }

  function onSubmit(values: ItemInput) {
    startTransition(async () => {
      const result = item ? await updateItem(item.id, values) : await createItem(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Zapisano zmiany" : "Dodano element");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edytuj element" : "Nowy element"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField label="Nazwa" htmlFor="name" error={errors.name?.message}>
            <Input id="name" aria-invalid={!!errors.name} {...form.register("name")} />
          </FormField>

          <FormField label="Opis" htmlFor="description" error={errors.description?.message}>
            <Textarea
              id="description"
              rows={4}
              aria-invalid={!!errors.description}
              {...form.register("description")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Status" error={errors.status?.message}>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={itemStatusLabels}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full" aria-invalid={!!errors.status}>
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {itemStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Priorytet" error={errors.priority?.message}>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select
                    items={itemPriorityLabels}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full" aria-invalid={!!errors.priority}>
                      <SelectValue placeholder="Wybierz…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {itemPriorityLabels[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Anuluj</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Zapisywanie…" : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
