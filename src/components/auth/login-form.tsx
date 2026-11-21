"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { PasswordInput } from "@/components/auth/password-input";
import { Input } from "@/components/shadcn/input";
import { authClient } from "@/lib/auth-client";
import { type LoginInput, loginSchema } from "@/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const { error } = await authClient.signIn.email(values);
      if (error) {
        toast.error("Niepoprawny e-mail lub hasło");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
          placeholder="Twoje hasło"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Nie masz konta?{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          Załóż konto
        </Link>
      </p>
    </form>
  );
}
