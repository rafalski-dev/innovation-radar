"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { authClient } from "@/lib/auth-client";
import { type RegisterInput, registerSchema } from "@/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const { error } = await authClient.signUp.email({
        name: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Imię" htmlFor="firstName" error={errors.firstName?.message}>
          <Input
            id="firstName"
            placeholder="np. Anna"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            {...form.register("firstName")}
          />
        </FormField>
        <FormField label="Nazwisko" htmlFor="lastName" error={errors.lastName?.message}>
          <Input
            id="lastName"
            placeholder="np. Kowalska"
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            {...form.register("lastName")}
          />
        </FormField>
      </div>
      <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          placeholder="jan.kowalski@example.com"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </FormField>
      <FormField label="Hasło" htmlFor="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          placeholder="Min. 8 znaków"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Zakładanie konta…" : "Załóż konto"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
