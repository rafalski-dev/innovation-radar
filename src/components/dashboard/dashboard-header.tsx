import Link from "next/link";
import { RadarIcon } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

// Nagłówek dashboardu: osobny od nagłówka strony publicznej (bez linków publicznych).
export function DashboardHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
            <RadarIcon className="size-4" />
          </span>
          {site.name}
        </Link>
        <span className="flex-1" />
        <ThemeToggle />
        <UserMenu name={name} />
      </div>
    </header>
  );
}
