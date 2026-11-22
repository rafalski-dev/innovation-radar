import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Logowanie" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <AuthCard
      accent="z powrotem"
      title="Witaj"
      description="Zaloguj się, żeby wrócić do swoich projektów."
    >
      <LoginForm />
    </AuthCard>
  );
}
