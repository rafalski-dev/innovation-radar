import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Nie pamiętam hasła" };

export default async function ForgotPasswordPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nie pamiętam hasła</CardTitle>
        <CardDescription>
          Podaj e-mail konta. Wyślemy link do ustawienia nowego hasła.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
