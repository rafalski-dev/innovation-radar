import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DeleteTeamButton, TeamMembers } from "@/components/team/team-members";
import { getTeam } from "@/queries/team";
import { innovationKey } from "@/validation/innovation";

export const metadata: Metadata = { title: "Zespół" };

export default async function TeamPage({ params }: PageProps<"/dashboard/teams/[id]">) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/teams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Wszystkie zespoły
      </Link>
      <PageHeader title={team.name} action={<DeleteTeamButton team={team} />} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Członkowie</h2>
        <TeamMembers team={team} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Pomysły zespołu</h2>
        {team.innovations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Brak. Przypisz pomysł do zespołu w formularzu pomysłu.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {team.innovations.map((i) => (
              <li key={i.id} className="px-3 py-2 text-sm">
                <Link href={`/dashboard/${i.number}`} className="hover:underline">
                  <span className="text-muted-foreground">{innovationKey(i.number)}</span> {i.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
