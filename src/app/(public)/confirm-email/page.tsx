import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerification } from "@/components/auth/resend-verification";
import { AuthCard } from "@/components/auth/auth-card";
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
    <AuthCard
      title="Sprawdź"
      accent="skrzynkę"
      description={
        email ? (
          <>
            Wysłaliśmy link potwierdzający na adres{" "}
            <strong className="text-foreground">{email}</strong>. Kliknij go, aby aktywować konto.
          </>
        ) : (
          "Wysłaliśmy link potwierdzający na Twój adres e-mail. Kliknij go, aby aktywować konto."
        )
      }
    >
      <div className="grid gap-4">
        <ResendVerification email={email} />
        <p className="text-center text-sm text-muted-foreground">
          Po potwierdzeniu możesz się{" "}
          <Link href="/login" className="font-medium text-foreground underline decoration-brand">
            zalogować
          </Link>
          .
        </p>
      </div>
    </AuthCard>
  );
}
