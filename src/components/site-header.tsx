import Link from "next/link";
import { RadarIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { buttonVariants } from "@/components/shadcn/button";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
            <RadarIcon className="size-4" />
          </span>
          {site.name}
        </Link>
        <SiteNav />
        <ThemeToggle />
        {session ? (
          <UserMenu name={session.user.name} />
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className={buttonVariants({
                size: "sm",
                className:
                  "rounded-full bg-brand text-white hover:bg-brand/90 dark:bg-brand dark:text-white",
              })}
            >
              Załóż konto
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
