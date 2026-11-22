"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItem, dashboardNav } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {(isAdmin ? [...dashboardNav, adminNavItem] : dashboardNav).map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
