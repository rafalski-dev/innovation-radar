import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { InnovationBoard } from "@/components/innovation/innovation-board";
import { InnovationForm } from "@/components/innovation/innovation-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/shadcn/button";
import { getInnovations } from "@/queries/innovation";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const innovations = await getInnovations(); // sprawdza sesję (redirect do /login)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Twoje zgłoszone pomysły według etapu procesu."
        action={
          <InnovationForm
            trigger={
              <Button>
                <PlusIcon />
                Nowy pomysł
              </Button>
            }
          />
        }
      />
      <InnovationBoard innovations={innovations} />
    </div>
  );
}
