"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";

// Menu hamburger dla wąskich ekranów: panel pod nagłówkiem, zamykany po przejściu na inną stronę i klawiszem Esc.
// Nagłówek musi być elementem pozycjonowanym (sticky), bo panel jest względem niego.
export function HamburgerMenu({ children }: { children: React.ReactNode }) {
  // menu jest otwarte tylko na stronie, na której je otwarto: po przejściu gdzie indziej zamyka się samo
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        {open ? <XIcon /> : <MenuIcon />}
        <span className="sr-only">{open ? "Zamknij menu" : "Otwórz menu"}</span>
      </Button>
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] space-y-4 overflow-y-auto border-b bg-background p-4 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
