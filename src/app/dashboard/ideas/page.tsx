import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { InnovationForm } from "@/components/innovation/innovation-form";
import { InnovationTable } from "@/components/innovation/innovation-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/shadcn/button";
import { getInnovations } from "@/queries/innovation";
import { getMyTeams } from "@/queries/team";

export const metadata: Metadata = { title: "Moje pomysły" };

export default async function IdeasPage() {
  const [innovations, teams] = await Promise.all([getInnovations(), getMyTeams()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje pomysły"
        description="Pomysły Twoje i Twoich zespołów. Edytować i usuwać można tylko zgłoszone."
        action={
          <InnovationForm
            teams={teams}
            trigger={
              <Button>
                <PlusIcon />
                Nowy pomysł
              </Button>
            }
          />
        }
      />
      <InnovationTable innovations={innovations} teams={teams} />
    </div>
  );
}
