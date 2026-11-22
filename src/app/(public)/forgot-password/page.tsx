import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Nie pamiętam hasła" };

export default async function ForgotPasswordPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <AuthCard
      title="Nie pamiętam"
      accent="hasła"
      description="Podaj e-mail konta. Wyślemy link do ustawienia nowego hasła."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
