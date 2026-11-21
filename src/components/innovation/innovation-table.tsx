import Link from "next/link";
import { InnovationRowActions } from "@/components/innovation/innovation-row-actions";
import { TypeBadge } from "@/components/innovation/type-badge";
import { Badge } from "@/components/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import type { InnovationRow } from "@/queries/innovation";
import { innovationKey, innovationStatusLabels } from "@/validation/innovation";

export function InnovationTable({
  innovations,
  teams,
}: {
  innovations: InnovationRow[];
  teams: { id: string; name: string }[];
}) {
  if (innovations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Brak pomysłów. Zgłoś pierwszy.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Klucz</TableHead>
            <TableHead>Tytuł</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Zespół</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {innovations.map((innovation) => (
            <TableRow key={innovation.id}>
              <TableCell className="text-muted-foreground">
                {innovationKey(innovation.number)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/${innovation.number}`}
                  className="font-medium hover:underline"
                >
                  {innovation.title}
                </Link>
              </TableCell>
              <TableCell>
                <TypeBadge type={innovation.type} />
              </TableCell>
              <TableCell>
                <Badge variant="outline">{innovationStatusLabels[innovation.status]}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {innovation.team?.name ?? "—"}
              </TableCell>
              <TableCell>
                <InnovationRowActions innovation={innovation} teams={teams} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
