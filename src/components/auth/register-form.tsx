"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { authClient } from "@/lib/auth-client";
import {
  type RegisterInput,
  USER_ROLES,
  registerSchema,
  roleDescriptions,
  userRoleLabels,
} from "@/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organization: "",
      position: "",
      interests: "",
    },
  });
  const { errors } = form.formState;
  const role = useWatch({ control: form.control, name: "role" });
  // krok 1: wybór roli, krok 2: dane zależne od roli
  const [step, setStep] = useState<1 | 2>(1);

  function nextStep() {
    if (!role) {
      form.setError("role", { message: "Wybierz, kim jesteś" });
      return;
    }
    setStep(2);
  }

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const isUser = values.role === "USER";
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        organization: isUser ? undefined : values.organization,
        position: values.role === "OFFICIAL" ? values.position : undefined,
        interests: values.role === "BUSINESS" ? values.interests || undefined : undefined,
      });
      if (error) {
        toast.error(
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
            error.code === "USER_ALREADY_EXISTS"
            ? "Konto z tym adresem e-mail już istnieje"
            : (error.message ?? "Nie udało się założyć konta"),
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (step === 1) {
    return (
      <div className="grid gap-4">
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-medium">Kim jesteś?</legend>
          {USER_ROLES.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                role === r && "border-primary bg-muted/50",
              )}
            >
              <input
                type="radio"
                value={r}
                className="mt-1 accent-current"
                checked={role === r}
                onChange={() => {
                  form.setValue("role", r);
                  form.clearErrors("role");
                }}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">{userRoleLabels[r]}</span>
                <span className="text-xs text-muted-foreground">{roleDescriptions[r]}</span>
              </span>
            </label>
          ))}
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </fieldset>
        <Button type="button" onClick={nextStep}>
          Dalej
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Rola: <span className="font-medium text-foreground">{role && userRoleLabels[role]}</span>
      </p>
      <FormField label="Imię" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...form.register("name")}
        />
      </FormField>
      <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </FormField>
      <FormField label="Hasło" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
      </FormField>
      {role !== "USER" && (
        <FormField
          label={role === "OFFICIAL" ? "Instytucja / urząd" : "Nazwa firmy"}
          htmlFor="organization"
          error={errors.organization?.message}
        >
          <Input
            id="organization"
            aria-invalid={!!errors.organization}
            {...form.register("organization")}
          />
        </FormField>
      )}
      {role === "OFFICIAL" && (
        <FormField label="Stanowisko" htmlFor="position" error={errors.position?.message}>
          <Input id="position" aria-invalid={!!errors.position} {...form.register("position")} />
        </FormField>
      )}
      {role === "BUSINESS" && (
        <FormField
          label="Czego szukasz? (opcjonalnie)"
          htmlFor="interests"
          error={errors.interests?.message}
        >
          <Textarea
            id="interests"
            rows={3}
            placeholder="Sektory, problemy, rodzaj rozwiązań…"
            {...form.register("interests")}
          />
        </FormField>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={pending}>
          Wstecz
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Zakładanie konta…" : "Załóż konto"}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
