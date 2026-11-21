import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { requireSession } from "@/lib/session";
import type { UserRole } from "@/validation/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();
  const role = ((session.user as { role?: string }).role ?? "USER") as UserRole;

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside>
        <DashboardSidebar role={role} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
