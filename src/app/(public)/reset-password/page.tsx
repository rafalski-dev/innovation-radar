import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { buttonVariants } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export const metadata: Metadata = { title: "Ustaw nowe hasło" };

// Better Auth przekierowuje tu z linku z maila: ?token=... albo ?error=INVALID_TOKEN.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Ustaw nowe hasło</CardTitle>
        <CardDescription>
          {token && !error
            ? "Wpisz nowe hasło do swojego konta."
            : "Ten link jest nieważny albo wygasł."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token && !error ? (
          <ResetPasswordForm token={token} />
        ) : (
          <Link href="/forgot-password" className={buttonVariants({ className: "w-full" })}>
            Poproś o nowy link
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
