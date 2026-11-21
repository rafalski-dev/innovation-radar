import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

// Nagłówek dashboardu: osobny od nagłówka strony publicznej (bez linków publicznych).
export function DashboardHeader({ name }: { name: string }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/dashboard" className="font-semibold">
          {site.name}
        </Link>
        <span className="flex-1" />
        <ThemeToggle />
        <UserMenu name={name} />
      </div>
    </header>
  );
}
