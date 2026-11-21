import Link from "next/link";
import { TypeBadge } from "@/components/innovation/type-badge";
import type { InnovationRow } from "@/queries/innovation";
import {
  INNOVATION_STATUSES,
  innovationKey,
  innovationStatusLabels,
} from "@/validation/innovation";

export function InnovationBoard({ innovations }: { innovations: InnovationRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
      {INNOVATION_STATUSES.map((status) => {
        const column = innovations.filter((i) => i.status === status);
        return (
          <section key={status} className="space-y-2 rounded-lg bg-muted/50 p-2">
            <h2 className="flex items-center justify-between px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {innovationStatusLabels[status]}
              <span className="rounded-full bg-background px-2 py-0.5 font-medium">
                {column.length}
              </span>
            </h2>
            {column.map((innovation) => (
              <Link
                key={innovation.id}
                href={`/dashboard/${innovation.number}`}
                className="block space-y-2 rounded-md border bg-card p-3 text-sm shadow-xs transition-colors hover:border-foreground/30"
              >
                <div className="font-medium">{innovation.title}</div>
                <div className="flex items-center justify-between gap-2">
                  <TypeBadge type={innovation.type} />
                  <span className="text-xs text-muted-foreground">
                    {innovationKey(innovation.number)}
                  </span>
                </div>
              </Link>
            ))}
            {column.length === 0 && (
              <p className="px-1 py-4 text-center text-xs text-muted-foreground">Brak</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
