"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { authClient } from "@/lib/auth-client";
import { type ForgotPasswordInput, forgotPasswordSchema } from "@/validation/auth";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sentTo, setSentTo] = useState<string>();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error("Nie udało się wysłać linku. Spróbuj ponownie za chwilę.");
        return;
      }
      setSentTo(values.email);
    });
  }

  if (sentTo) {
    return (
      <div className="grid gap-4 text-sm">
        <p>
          Jeśli konto z adresem <strong>{sentTo}</strong> istnieje, wysłaliśmy na nie link do
          ustawienia nowego hasła. Jest ważny przez godzinę. Sprawdź też folder ze spamem.
        </p>
        <Link href="/login" className="text-center font-medium underline">
          Wróć do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormField label="E-mail" htmlFor="fp-email" error={errors.email?.message}>
        <Input
          id="fp-email"
          type="email"
          placeholder="jan.kowalski@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Wysyłanie…" : "Wyślij link do resetu"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
