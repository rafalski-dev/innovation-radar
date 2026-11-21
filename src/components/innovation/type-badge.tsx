import { Badge } from "@/components/shadcn/badge";
import { cn } from "@/lib/utils";
import { type InnovationType, innovationTypeLabels } from "@/validation/innovation";

const typeColors: Record<InnovationType, string> = {
  TECHNOLOGICAL: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  ORGANIZATIONAL: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  EDUCATIONAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  SOCIAL: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
  PROCESS: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
};

export function TypeBadge({ type }: { type: InnovationType }) {
  return (
    <Badge variant="secondary" className={cn("border-transparent", typeColors[type])}>
      {innovationTypeLabels[type]}
    </Badge>
  );
}
