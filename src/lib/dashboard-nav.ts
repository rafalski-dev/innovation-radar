import { LayoutDashboardIcon, UserIcon } from "lucide-react";

// Nawigacja dashboardu: jedno miejsce. Kolejne sekcje (potrzeby, wyniki, listy, panel
// administracji) dojdą tu jako osobne pozycje.
export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboardIcon },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
];
