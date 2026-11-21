import { ItemRowActions } from "@/components/item/item-row-actions";
import { Badge } from "@/components/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import type { ItemRow } from "@/queries/item";
import { itemPriorityLabels, itemStatusLabels } from "@/validation/item";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" });

export function ItemTable({ items }: { items: ItemRow[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        Brak elementów. Dodaj pierwszy.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorytet</TableHead>
            <TableHead>Dodano</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                    {item.description}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
                  {itemStatusLabels[item.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={item.priority === "HIGH" ? "destructive" : "outline"}>
                  {itemPriorityLabels[item.priority]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {dateFormat.format(item.createdAt)}
              </TableCell>
              <TableCell>
                <ItemRowActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
