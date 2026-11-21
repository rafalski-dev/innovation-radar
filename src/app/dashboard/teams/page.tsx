import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/shadcn/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { TeamForm } from "@/components/team/team-form";
import { getMyTeams } from "@/queries/team";

export const metadata: Metadata = { title: "Zespoły" };

export default async function TeamsPage() {
  const teams = await getMyTeams();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zespoły"
        description="Zespół wspólnie widzi i edytuje przypisane do niego pomysły."
        action={
          <TeamForm
            trigger={
              <Button>
                <PlusIcon />
                Nowy zespół
              </Button>
            }
          />
        }
      />
      {teams.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Nie należysz jeszcze do żadnego zespołu.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    Członków: {team._count.members} · pomysłów: {team._count.innovations}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
