import Link from "next/link";
import { RadarIcon } from "lucide-react";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { UserMenu } from "@/components/auth/user-menu";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavCounts } from "@/lib/dashboard-nav";
import { site } from "@/lib/site";

// Nagłówek dashboardu: osobny od nagłówka strony publicznej (bez linków publicznych).
// Logo prowadzi na stronę główną. Na wąskich ekranach opcje są w menu hamburger (razem z nawigacją panelu).
export function DashboardHeader({
  name,
  isAdmin,
  counts,
}: {
  name: string;
  isAdmin: boolean;
  counts: NavCounts;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
            <RadarIcon className="size-4" />
          </span>
          {site.name}
        </Link>
        <span className="flex-1" />
        <div className="hidden items-center gap-2 md:flex">
          <AccessibilityMenu />
          <ThemeToggle />
          <UserMenu name={name} />
        </div>
        <HamburgerMenu>
          <DashboardSidebar isAdmin={isAdmin} counts={counts} />
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Motyw</span>
            <ThemeToggle />
          </div>
          <AccessibilityMenu inline />
          <div className="border-t pt-4">
            <UserMenu name={name} />
          </div>
        </HamburgerMenu>
      </div>
    </header>
  );
}
