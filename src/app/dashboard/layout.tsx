import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ensureAdminRole } from "@/lib/admin";
import { requireSession } from "@/lib/session";
import { getNavCounts } from "@/queries/dashboard";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();
  const [isAdmin, counts] = await Promise.all([
    ensureAdminRole(session.user.id, session.user.email, (session.user as { role?: string }).role),
    getNavCounts(),
  ]);

  return (
    <div className="relative isolate flex flex-1 flex-col">
      {/* delikatna bursztynowa poświata u góry panelu, jak na stronie głównej */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(55%_100%_at_50%_0%,color-mix(in_oklab,var(--brand)_13%,transparent),transparent)] print:hidden"
      />
      <div className="print:hidden">
        <DashboardHeader name={session.user.name} isAdmin={isAdmin} counts={counts} />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:p-0">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[200px_minmax(0,1fr)] print:block">
          <aside className="hidden border-r pr-6 md:block print:hidden">
            <DashboardSidebar isAdmin={isAdmin} counts={counts} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
