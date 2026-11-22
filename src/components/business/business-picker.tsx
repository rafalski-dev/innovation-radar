"use client";

import Link from "next/link";
import { useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";
import { deleteBusiness } from "@/actions/business";
import { BusinessMembers } from "@/components/business/business-members";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { ProjectAttachments } from "@/components/project/project-attachments";
import { ProjectRowActions } from "@/components/project/project-row-actions";
import { buttonVariants } from "@/components/shadcn/button";
import type { BusinessWithProjects } from "@/queries/business";
import { cn } from "@/lib/utils";

// Organizacje jako radio group (nie lista): wybrana pokazuje swoje dane i potrzeby na tej samej stronie.
export function BusinessPicker({
  businesses,
  initialId,
}: {
  businesses: BusinessWithProjects[];
  initialId?: string;
}) {
  const [selectedId, setSelectedId] = useState(initialId ?? businesses[0]?.id);
  // po usunięciu wybranej organizacji wracamy do pierwszej z listy
  const selected = businesses.find((b) => b.id === selectedId) ?? businesses[0];

  if (!selected) {
    return (
      <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        Nie masz jeszcze żadnej organizacji. Dodaj pierwszą.
      </p>
    );
  }

  const subtitle = [selected.industry, selected.city].filter(Boolean).join(" · ");
  const address = [selected.street, [selected.postalCode, selected.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">Wybierz organizację</legend>
        {businesses.map((b) => (
          <label
            key={b.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground/30",
              b.id === selected.id && "border-foreground/60 bg-muted/70 ring-1 ring-foreground/15",
            )}
          >
            <input
              type="radio"
              name="organization"
              value={b.id}
              checked={b.id === selected.id}
              onChange={() => setSelectedId(b.id)}
              className="mt-1 accent-current"
            />
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate text-sm font-medium">{b.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {[b.city, b.nip && `NIP ${b.nip}`].filter(Boolean).join(" · ") || "—"}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">{selected.name}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {selected.isAdmin ? (
            <div className="flex gap-1">
              <Link
                href={`/dashboard/businesses/${selected.id}/edit`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <PencilIcon />
                Edytuj
              </Link>
              <ConfirmDeleteButton
                itemName={selected.name}
                onConfirm={() => deleteBusiness(selected.id)}
              />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Jesteś członkiem tej organizacji</span>
          )}
        </div>

        <dl className="grid gap-1 text-sm sm:grid-cols-[6rem_1fr]">
          {selected.nip && (
            <>
              <dt className="text-muted-foreground">NIP</dt>
              <dd>{selected.nip}</dd>
            </>
          )}
          {address && (
            <>
              <dt className="text-muted-foreground">Adres</dt>
              <dd>{address}</dd>
            </>
          )}
          {selected.website && (
            <>
              <dt className="text-muted-foreground">Strona</dt>
              <dd>
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {selected.website.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </>
          )}
        </dl>
        {selected.description && <p className="max-w-2xl text-sm">{selected.description}</p>}

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Projekty</h3>
            <Link
              href={`/dashboard/businesses/${selected.id}/projects/new`}
              className={buttonVariants({ size: "sm" })}
            >
              <PlusIcon />
              Nowy projekt
            </Link>
          </div>
          {selected.projects.length === 0 ? (
            <p className="rounded-2xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              Ta organizacja nie ma jeszcze żadnego projektu. Opisz pierwszą.
            </p>
          ) : (
            <ul className="grid gap-3">
              {selected.projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-start justify-between gap-4 rounded-xl border p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="font-medium">{project.title}</div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <ProjectAttachments project={project} />
                  </div>
                  <ProjectRowActions project={project} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <BusinessMembers key={selected.id} business={selected} />
      </section>
    </div>
  );
}
