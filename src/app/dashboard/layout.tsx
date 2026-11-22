import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ensureAdminRole } from "@/lib/admin";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();
  const isAdmin = await ensureAdminRole(
    session.user.id,
    session.user.email,
    (session.user as { role?: string }).role,
  );

  return (
    <>
      <div className="print:hidden">
        <DashboardHeader name={session.user.name} />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:p-0">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] print:block">
          <aside className="print:hidden border-b pb-3 md:border-r md:border-b-0 md:pr-6 md:pb-0">
            <DashboardSidebar isAdmin={isAdmin} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </>
  );
}
