import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Rejestracja" };

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Załóż konto</CardTitle>
        <CardDescription>Zgłaszaj pomysły i śledź ich status.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
