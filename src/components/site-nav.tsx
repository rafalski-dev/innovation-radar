"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 items-center gap-4 text-sm">
      {site.nav.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              active && "font-medium text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
