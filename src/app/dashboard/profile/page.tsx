import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { PasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { userRoleLabels } from "@/validation/auth";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  await connection();
  const session = await requireSession();
  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profil"
        description={`${user.email} · rola: ${userRoleLabels[user.role]}`}
      />
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Dane</h2>
        <ProfileForm
          role={user.role}
          defaultValues={{
            name: user.name,
            organization: user.organization ?? "",
            position: user.position ?? "",
            interests: user.interests ?? "",
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
