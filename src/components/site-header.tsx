import Link from "next/link";
import { RadarIcon } from "lucide-react";
import { AccessibilityMenu } from "@/components/accessibility-menu";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { buttonVariants } from "@/components/shadcn/button";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";

export async function SiteHeader() {
  const session = await getSession();

  const authBlock = (
    <>
      {session ? (
        <UserMenu name={session.user.name} />
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-9 bg-card/60 px-4 text-sm",
            })}
          >
            Zaloguj się
          </Link>
          <Link
            href="/register"
            className={buttonVariants({
              size: "sm",
              className:
                "h-9 bg-brand px-4 text-sm text-white hover:bg-brand/90 dark:bg-brand dark:text-white",
            })}
          >
            Załóż konto
          </Link>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
            <RadarIcon className="size-4" />
          </span>
          {site.name}
        </Link>
        <div className="hidden flex-1 items-center justify-end gap-6 md:flex">
          <SiteNav />
          <AccessibilityMenu />
          <ThemeToggle />
          {authBlock}
        </div>
        <span className="flex-1 md:hidden" />
        <HamburgerMenu>
          <SiteNav vertical />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Motyw</span>
            <ThemeToggle />
          </div>
          <AccessibilityMenu inline />
          <div className="border-t pt-4">{authBlock}</div>
        </HamburgerMenu>
      </div>
    </header>
  );
}
