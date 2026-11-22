"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authSubmitClass } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { authClient } from "@/lib/auth-client";
import { type ResetPasswordInput, resetPasswordSchema } from "@/validation/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirm: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const { error } = await authClient.resetPassword({ newPassword: values.newPassword, token });
      if (error) {
        toast.error("Link jest nieważny lub wygasł. Poproś o nowy.");
        return;
      }
      toast.success("Hasło zostało zmienione. Zaloguj się nowym hasłem.");
      router.push("/login");
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <FormField label="Nowe hasło" htmlFor="rp-new" error={errors.newPassword?.message}>
        <PasswordInput
          id="rp-new"
          placeholder="Min. 8 znaków"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...form.register("newPassword")}
        />
      </FormField>
      <FormField label="Powtórz nowe hasło" htmlFor="rp-confirm" error={errors.confirm?.message}>
        <PasswordInput
          id="rp-confirm"
          placeholder="Powtórz nowe hasło"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm}
          {...form.register("confirm")}
        />
      </FormField>
      <Button type="submit" disabled={pending} className={authSubmitClass}>
        {pending ? "Zapisywanie…" : "Ustaw nowe hasło"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
