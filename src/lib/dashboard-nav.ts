import {
  BriefcaseIcon,
  ClipboardCheckIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { UserRole } from "@/validation/auth";

// Nawigacja dashboardu: jedno miejsce, pozycje zależne od roli.
// soon = pozycja widoczna, ale jeszcze nieaktywna.
export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[]; // brak = wszyscy
  soon?: boolean;
};

export const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Tablica", icon: LayoutDashboardIcon },
  { href: "/dashboard/ideas", label: "Moje pomysły", icon: LightbulbIcon, roles: ["USER"] },
  { href: "/dashboard/teams", label: "Zespoły", icon: UsersIcon, roles: ["USER"] },
  {
    href: "/dashboard/review",
    label: "Do oceny",
    icon: ClipboardCheckIcon,
    roles: ["OFFICIAL"],
    soon: true,
  },
  {
    href: "/dashboard/needs",
    label: "Zapotrzebowania",
    icon: BriefcaseIcon,
    roles: ["BUSINESS"],
    soon: true,
  },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
];
