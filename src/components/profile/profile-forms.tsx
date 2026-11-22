"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { authClient } from "@/lib/auth-client";
import {
  type PasswordInput as PasswordValues,
  type ProfileInput,
  passwordSchema,
  profileSchema,
} from "@/validation/profile";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });
  const { errors } = form.formState;

  function onSubmit(values: ProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.success) toast.success("Zapisano profil");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <FormField label="Imię" htmlFor="p-first" error={errors.firstName?.message}>
          <Input
            id="p-first"
            placeholder="Imię"
            aria-invalid={!!errors.firstName}
            {...form.register("firstName")}
          />
        </FormField>
        <FormField label="Nazwisko" htmlFor="p-last" error={errors.lastName?.message}>
          <Input
            id="p-last"
            placeholder="Nazwisko"
            aria-invalid={!!errors.lastName}
            {...form.register("lastName")}
          />
        </FormField>
      </div>
      <FormField
        label="Stanowisko (opcjonalnie)"
        htmlFor="p-position"
        error={errors.position?.message}
      >
        <Input
          id="p-position"
          placeholder="np. Dyrektor ds. rozwoju"
          autoComplete="organization-title"
          aria-invalid={!!errors.position}
          {...form.register("position")}
        />
      </FormField>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "Zapisywanie…" : "Zapisz profil"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: PasswordValues) {
    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error("Nie udało się zmienić hasła. Sprawdź obecne hasło.");
        return;
      }
      toast.success("Zmieniono hasło");
      form.reset();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-md gap-4">
      <FormField label="Obecne hasło" htmlFor="pw-cur" error={errors.currentPassword?.message}>
        <PasswordInput
          id="pw-cur"
          aria-invalid={!!errors.currentPassword}
          placeholder="Obecne hasło"
          autoComplete="current-password"
          {...form.register("currentPassword")}
        />
      </FormField>
      <FormField label="Nowe hasło" htmlFor="pw-new" error={errors.newPassword?.message}>
        <PasswordInput
          id="pw-new"
          aria-invalid={!!errors.newPassword}
          placeholder="Min. 8 znaków"
          autoComplete="new-password"
          {...form.register("newPassword")}
        />
      </FormField>
      <FormField label="Powtórz nowe hasło" htmlFor="pw-conf" error={errors.confirm?.message}>
        <PasswordInput
          id="pw-conf"
          aria-invalid={!!errors.confirm}
          placeholder="Powtórz nowe hasło"
          autoComplete="new-password"
          {...form.register("confirm")}
        />
      </FormField>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "Zapisywanie…" : "Zmień hasło"}
      </Button>
    </form>
  );
}
