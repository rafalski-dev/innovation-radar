import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { PasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  await connection();
  const session = await requireSession();
  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="space-y-8">
      <PageHeader title="Profil" description={user.email} />
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Dane</h2>
        <ProfileForm
          defaultValues={{
            // starsze konta nie mają osobnych pól: dzielimy zapisane imię i nazwisko
            firstName: user.firstName ?? user.name.split(" ")[0] ?? "",
            lastName: user.lastName ?? user.name.split(" ").slice(1).join(" "),
            position: user.position ?? "",
          }}
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Zmiana hasła</h2>
        <ol className="max-w-md list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Wpisz swoje obecne hasło, żeby potwierdzić, że to Ty.</li>
          <li>Podaj nowe hasło (min. 8 znaków) i powtórz je w drugim polu.</li>
          <li>
            Po zapisaniu zostaniesz wylogowany(-a) ze wszystkich innych urządzeń, a w tej
            przeglądarce nadal jesteś zalogowany(-a).
          </li>
          <li>
            Nie pamiętasz obecnego hasła? Wyloguj się i użyj odnośnika „Nie pamiętam hasła” na
            stronie logowania: wyślemy link do ustawienia nowego.
          </li>
        </ol>
        <PasswordForm />
      </section>
    </div>
  );
}
