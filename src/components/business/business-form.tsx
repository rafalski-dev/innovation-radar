"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createBusiness, updateBusiness } from "@/actions/business";
import { FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import type { BusinessRow } from "@/queries/business";
import { type BusinessInput, businessSchema } from "@/validation/business";

function toDefaults(business?: BusinessRow): BusinessInput {
  return {
    name: business?.name ?? "",
    nip: business?.nip ?? "",
    industry: business?.industry ?? "",
    street: business?.street ?? "",
    postalCode: business?.postalCode ?? "",
    city: business?.city ?? "",
    website: business?.website ?? "",
  };
}

// brak business = dodawanie, jest = edycja
export function BusinessForm({ business }: { business?: BusinessRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema),
    defaultValues: toDefaults(business),
  });
  const { errors } = form.formState;

  function onSubmit(values: BusinessInput) {
    startTransition(async () => {
      const result = business
        ? await updateBusiness(business.id, values)
        : await createBusiness(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(business ? "Zapisano zmiany" : "Dodano organizację");
      router.push("/dashboard/businesses");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormField label="Nazwa organizacji" htmlFor="b-name" error={errors.name?.message}>
        <Input
          id="b-name"
          placeholder="np. Januszex Sp. z o.o."
          aria-invalid={!!errors.name}
          {...form.register("name")}
        />
      </FormField>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField label="NIP" htmlFor="b-nip" error={errors.nip?.message}>
          <Input
            id="b-nip"
            inputMode="numeric"
            placeholder="np. 5252344078"
            aria-invalid={!!errors.nip}
            readOnly={!!business}
            aria-readonly={!!business}
            className={
              business ? "cursor-not-allowed bg-muted/50 text-muted-foreground" : undefined
            }
            {...form.register("nip")}
          />
          {business && (
            <p className="text-xs text-muted-foreground">
              NIP nie podlega edycji po utworzeniu organizacji.
            </p>
          )}
        </FormField>
        <FormField
          label="Branża (opcjonalnie)"
          htmlFor="b-industry"
          error={errors.industry?.message}
        >
          <Input
            id="b-industry"
            aria-invalid={!!errors.industry}
            placeholder="np. Produkcja, IT, edukacja"
            {...form.register("industry")}
          />
        </FormField>
      </div>

      <FormField label="Ulica i numer" htmlFor="b-street" error={errors.street?.message}>
        <Input
          id="b-street"
          aria-invalid={!!errors.street}
          placeholder="np. ul. Długa 12/3"
          autoComplete="street-address"
          {...form.register("street")}
        />
      </FormField>

      <div className="grid items-start gap-4 sm:grid-cols-[10rem_1fr]">
        <FormField label="Kod pocztowy" htmlFor="b-postal" error={errors.postalCode?.message}>
          <Input
            id="b-postal"
            placeholder="00-000"
            autoComplete="postal-code"
            aria-invalid={!!errors.postalCode}
            {...form.register("postalCode")}
          />
        </FormField>
        <FormField label="Miasto" htmlFor="b-city" error={errors.city?.message}>
          <Input
            id="b-city"
            aria-invalid={!!errors.city}
            placeholder="np. Rzeszów"
            autoComplete="address-level2"
            {...form.register("city")}
          />
        </FormField>
      </div>

      <FormField
        label="Strona www (opcjonalnie)"
        htmlFor="b-website"
        error={errors.website?.message}
      >
        <Input
          id="b-website"
          placeholder="https://"
          aria-invalid={!!errors.website}
          {...form.register("website")}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Link href="/dashboard/businesses" className={buttonVariants({ variant: "outline" })}>
          Anuluj
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : business ? "Zapisz" : "Dodaj organizację"}
        </Button>
      </div>
    </form>
  );
}
