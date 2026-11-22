import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { buttonVariants } from "@/components/shadcn/button";
import { AuthCard, authSubmitClass } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Ustaw nowe hasło" };

// Better Auth przekierowuje tu z linku z maila: ?token=... albo ?error=INVALID_TOKEN.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <AuthCard
      title="Ustaw nowe"
      accent="hasło"
      description={
        token && !error
          ? "Wpisz nowe hasło do swojego konta."
          : "Ten link jest nieważny albo wygasł."
      }
    >
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Link href="/forgot-password" className={buttonVariants({ className: authSubmitClass })}>
          Poproś o nowy link
        </Link>
      )}
    </AuthCard>
  );
}
