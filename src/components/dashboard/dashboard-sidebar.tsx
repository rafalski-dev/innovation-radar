"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItem, dashboardNav, type NavCounts } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  isAdmin = false,
  counts,
}: {
  isAdmin?: boolean;
  counts: NavCounts;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {(isAdmin ? [...dashboardNav, adminNavItem] : dashboardNav).map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-brand/12 font-medium text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            <span>
              {item.label}
              {item.count && (
                <span className="font-normal tabular-nums opacity-70"> ({counts[item.count]})</span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
