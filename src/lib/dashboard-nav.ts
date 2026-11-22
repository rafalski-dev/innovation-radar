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
// Liczniki przy pozycjach menu (wartości z `getNavCounts`).
export type NavCounts = { businesses: number; projects: number; searches: number };

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: keyof NavCounts; // pozycja pokazuje licznik, np. „Projekty (1)”
};

export const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboardIcon },
  { href: "/dashboard/businesses", label: "Organizacje", icon: BuildingIcon, count: "businesses" },
  { href: "/dashboard/projects", label: "Projekty", icon: ClipboardListIcon, count: "projects" },
  { href: "/dashboard/search", label: "Aspekty", icon: SearchIcon, count: "searches" },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
];

// Pozycja widoczna tylko dla administratora radaru.
export const adminNavItem: DashboardNavItem = {
  href: "/dashboard/admin",
  label: "Panel admina",
  icon: ShieldIcon,
};
