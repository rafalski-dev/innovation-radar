import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cześć, ${session.user.name}`}
        description="Tu pojawi się opis Twojego zapotrzebowania, wyniki wyszukiwania i listy tematyczne."
      />
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Wyszukiwanie innowacji jest w przygotowaniu.
      </p>
    </div>
  );
}
