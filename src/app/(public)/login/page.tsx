import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Logowanie" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>Wejdź do swojego dashboardu zgłoszeń.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
