import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerification } from "@/components/auth/resend-verification";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Potwierdź e-mail" };

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  if (await getSession()) redirect("/dashboard");
  const { email } = await searchParams;

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sprawdź skrzynkę</CardTitle>
        <CardDescription>
          {email ? (
            <>
              Wysłaliśmy link potwierdzający na adres <strong>{email}</strong>. Kliknij go, aby
              aktywować konto.
            </>
          ) : (
            "Wysłaliśmy link potwierdzający na Twój adres e-mail. Kliknij go, aby aktywować konto."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ResendVerification email={email} />
        <p className="text-center text-sm text-muted-foreground">
          Po potwierdzeniu możesz się{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            zalogować
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
