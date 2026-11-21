"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createNeed, updateNeed } from "@/actions/need";
import { FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import type { NeedRow } from "@/queries/need";
import { type NeedInput, needSchema } from "@/validation/need";

// brak need = dodawanie, jest = edycja
export function NeedForm({ businessId, need }: { businessId: string; need?: NeedRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const backHref = `/dashboard/businesses/${businessId}`;
  const form = useForm<NeedInput>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      title: need?.title ?? "",
      expectedOutcome: need?.expectedOutcome ?? "",
      description: need?.description ?? "",
    },
  });
  const { errors } = form.formState;

  function onSubmit(values: NeedInput) {
    startTransition(async () => {
      const result = need
        ? await updateNeed(need.id, values)
        : await createNeed(businessId, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(need ? "Zapisano zmiany" : "Dodano potrzebę");
      router.push(backHref);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl gap-4">
      <FormField label="Tytuł potrzeby" htmlFor="n-title" error={errors.title?.message}>
        <Input
          id="n-title"
          placeholder="np. Automatyczna kontrola jakości na linii"
          aria-invalid={!!errors.title}
          {...form.register("title")}
        />
      </FormField>

      <FormField
        label="Oczekiwany efekt"
        htmlFor="n-outcome"
        error={errors.expectedOutcome?.message}
      >
        <Textarea
          id="n-outcome"
          rows={4}
          placeholder="Co chcesz osiągnąć?"
          aria-invalid={!!errors.expectedOutcome}
          {...form.register("expectedOutcome")}
        />
      </FormField>

      <FormField
        label="Zapotrzebowanie"
        htmlFor="n-description"
        error={errors.description?.message}
      >
        <Textarea
          id="n-description"
          rows={6}
          placeholder="Jakiego rozwiązania szukasz, jakie masz ograniczenia (budżet, technologia, termin)?"
          aria-invalid={!!errors.description}
          {...form.register("description")}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          Anuluj
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : need ? "Zapisz" : "Dodaj potrzebę"}
        </Button>
      </div>
    </form>
  );
}
