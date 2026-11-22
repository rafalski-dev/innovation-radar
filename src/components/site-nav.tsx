"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteNav({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex text-sm", vertical ? "flex-col gap-3" : "flex-1 items-center gap-4")}>
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
