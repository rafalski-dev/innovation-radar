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
import { Textarea } from "@/components/shadcn/textarea";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/validation/auth";
import {
  type PasswordInput as PasswordValues,
  type ProfileInput,
  passwordSchema,
  profileSchema,
} from "@/validation/profile";

export function ProfileForm({
  role,
  defaultValues,
}: {
  role: UserRole;
  defaultValues: ProfileInput;
}) {
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
      <FormField label="Imię" htmlFor="p-name" error={errors.name?.message}>
        <Input id="p-name" aria-invalid={!!errors.name} {...form.register("name")} />
      </FormField>
      {role !== "USER" && (
        <FormField
          label={role === "OFFICIAL" ? "Instytucja / urząd" : "Nazwa firmy"}
          htmlFor="p-org"
          error={errors.organization?.message}
        >
          <Input id="p-org" {...form.register("organization")} />
        </FormField>
      )}
      {role === "OFFICIAL" && (
        <FormField label="Stanowisko" htmlFor="p-pos" error={errors.position?.message}>
          <Input id="p-pos" {...form.register("position")} />
        </FormField>
      )}
      {role === "BUSINESS" && (
        <FormField label="Czego szukasz?" htmlFor="p-int" error={errors.interests?.message}>
          <Textarea id="p-int" rows={3} {...form.register("interests")} />
        </FormField>
      )}
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
          autoComplete="current-password"
          {...form.register("currentPassword")}
        />
      </FormField>
      <FormField label="Nowe hasło" htmlFor="pw-new" error={errors.newPassword?.message}>
        <PasswordInput id="pw-new" autoComplete="new-password" {...form.register("newPassword")} />
      </FormField>
      <FormField label="Powtórz nowe hasło" htmlFor="pw-conf" error={errors.confirm?.message}>
        <PasswordInput id="pw-conf" autoComplete="new-password" {...form.register("confirm")} />
      </FormField>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "Zapisywanie…" : "Zmień hasło"}
      </Button>
    </form>
  );
}
