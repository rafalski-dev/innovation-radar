import {
  BuildingIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  ClipboardListIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";

// Nawigacja dashboardu: jedno miejsce. Kolejne sekcje (potrzeby, wyniki, listy, panel
// administracji) dojdą tu jako osobne pozycje.
export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboardIcon },
  { href: "/dashboard/businesses", label: "Moje organizacje", icon: BuildingIcon },
  { href: "/dashboard/projects", label: "Projekty", icon: ClipboardListIcon },
  { href: "/dashboard/search", label: "Aspekty", icon: SearchIcon },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
];

// Pozycja widoczna tylko dla administratora radaru.
export const adminNavItem: DashboardNavItem = {
  href: "/dashboard/admin",
  label: "Panel admina",
  icon: ShieldIcon,
};
