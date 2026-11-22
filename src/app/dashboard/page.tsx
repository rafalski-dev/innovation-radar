import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, BuildingIcon, PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/shadcn/button";
import { aspectLabel, projectNumber } from "@/lib/numbering";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { getDashboardOverview } from "@/queries/dashboard";

export const metadata: Metadata = { title: "Panel" };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" });

const primaryCta =
  "gap-2 bg-brand px-5 text-white shadow-lg shadow-brand/25 hover:bg-brand/90 dark:bg-brand dark:text-white";

export default async function DashboardPage() {
  const session = await requireSession();
  const overview = await getDashboardOverview();
  const firstName =
    (session.user as { firstName?: string | null }).firstName ?? session.user.name.split(" ")[0];

  const metrics = [
    ["Organizacje", overview.businesses, "/dashboard/businesses"],
    ["Projekty", overview.projects, "/dashboard/projects"],
    ["Aspekty", overview.searches, "/dashboard/search"],
    ["Wyniki", overview.results, "/dashboard/search"],
    [
      "Średnie TRL",
      overview.avgTrl == null ? "—" : overview.avgTrl.toFixed(1).replace(".", ","),
      "/dashboard/search",
    ],
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cześć,"
        accent={firstName}
        description="Oto podsumowanie Twoich projektów i aspektów."
        action={
          overview.businesses > 0 ? (
            <Link
              href="/dashboard/projects/new"
              className={buttonVariants({ size: "lg", className: cn(primaryCta, "h-10") })}
            >
              <PlusIcon />
              Nowy projekt
            </Link>
          ) : undefined
        }
      />

      {overview.businesses === 0 ? (
        <section className="relative isolate overflow-hidden rounded-3xl border px-6 py-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_50%_100%,color-mix(in_oklab,var(--brand)_24%,transparent),transparent)]"
          />
          <div className="mx-auto max-w-md space-y-3">
            <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
              <BuildingIcon className="size-5" />
            </span>
            <h2 className="text-2xl font-medium tracking-tight">
              Zacznij od dodania{" "}
              <em className="font-serif font-normal text-brand italic">organizacji</em>
            </h2>
            <p className="text-sm text-muted-foreground">
              Projekty i aspekty należą do organizacji. Dodaj swoją firmę, a potem pierwszy projekt.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/businesses/new"
                className={buttonVariants({ size: "lg", className: cn(primaryCta, "h-10") })}
              >
                Dodaj organizację
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {metrics.map(([label, value, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="block rounded-2xl border bg-card p-4 transition-colors hover:border-brand/50"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-3 rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Ostatnie projekty</h2>
                <Link
                  href="/dashboard/projects"
                  className="text-xs text-muted-foreground hover:text-brand"
                >
                  Wszystkie →
                </Link>
              </div>
              {overview.recentProjects.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nie masz jeszcze żadnego projektu.
                </p>
              ) : (
                <ul className="divide-y">
                  {overview.recentProjects.map((project) => (
                    <li key={project.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link href="/dashboard/projects" className="group block space-y-0.5">
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {projectNumber(project.createdAt)}
                        </p>
                        <p className="text-sm font-medium group-hover:text-brand">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.business.name} · aspekty: {project._count.searches}
                          {project.sentAt && " · raport wysłany"}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3 rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Ostatnie aspekty</h2>
                <Link
                  href="/dashboard/search"
                  className="text-xs text-muted-foreground hover:text-brand"
                >
                  Wszystkie →
                </Link>
              </div>
              {overview.recentSearches.length === 0 ? (
                <div className="space-y-3 py-6 text-center">
                  <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnego aspektu.</p>
                  <Link
                    href="/dashboard/search/new"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <PlusIcon />
                    Nowy aspekt
                  </Link>
                </div>
              ) : (
                <ul className="divide-y">
                  {overview.recentSearches.map((search) => (
                    <li key={search.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        href={`/dashboard/search/${search.id}`}
                        className="group block space-y-0.5"
                      >
                        {aspectLabel(search.number, search.project?.createdAt) && (
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {aspectLabel(search.number, search.project?.createdAt)}
                          </p>
                        )}
                        <p className="line-clamp-1 text-sm font-medium group-hover:text-brand">
                          {search.title ?? search.project?.title ?? search.query}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dateFormat.format(search.createdAt)} · wyniki: {search._count.results}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
