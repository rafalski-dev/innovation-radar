"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/validation/auth";

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = dashboardNav.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        const className = cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
          active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50",
          item.soon && "pointer-events-none opacity-50",
        );
        const content = (
          <>
            <item.icon className="size-4" />
            {item.label}
            {item.soon && <span className="text-xs">(wkrótce)</span>}
          </>
        );
        return item.soon ? (
          <span key={item.href} className={className}>
            {content}
          </span>
        ) : (
          <Link key={item.href} href={item.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
