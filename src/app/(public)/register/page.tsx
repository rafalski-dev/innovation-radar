import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Rejestracja" };

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <AuthCard
      title="Załóż"
      accent="konto"
      description="Opisz projekt, a agent znajdzie rozwiązania. Zajmie to minutę."
    >
      <RegisterForm />
    </AuthCard>
  );
}
