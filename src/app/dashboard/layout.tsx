import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();

  return (
    <>
      <DashboardHeader name={session.user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <aside>
            <DashboardSidebar />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </>
  );
}
