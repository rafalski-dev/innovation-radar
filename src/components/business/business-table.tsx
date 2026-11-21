import Link from "next/link";
import { BusinessRowActions } from "@/components/business/business-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import type { BusinessRow } from "@/queries/business";

export function BusinessTable({ businesses }: { businesses: BusinessRow[] }) {
  if (businesses.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Nie masz jeszcze żadnej organizacji. Dodaj pierwszą.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Branża</TableHead>
            <TableHead>Miasto</TableHead>
            <TableHead>Strona</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link
                  href={`/dashboard/businesses/${b.id}`}
                  className="font-medium hover:underline"
                >
                  {b.name}
                </Link>
                {b.description && (
                  <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                    {b.description}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{b.industry ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{b.city ?? "—"}</TableCell>
              <TableCell>
                {b.website ? (
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    {b.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <BusinessRowActions business={b} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
