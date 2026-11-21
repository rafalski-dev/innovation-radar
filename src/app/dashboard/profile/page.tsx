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
          }}
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Zmiana hasła</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
