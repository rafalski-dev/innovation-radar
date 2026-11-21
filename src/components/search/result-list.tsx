import { ExternalLinkIcon } from "lucide-react";

export type ResultItem = {
  title: string;
  summary: string;
  organization?: string | null;
  sourceName: string;
  sourceUrl: string;
  why: string;
};

// Lista wyników agenta (karty z opisem, uzasadnieniem i linkiem do źródła).
export function ResultList({ items }: { items: ResultItem[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((r) => (
        <li key={r.sourceUrl} className="space-y-2 rounded-lg border p-4">
          <p className="font-medium">{r.title}</p>
          <p className="text-sm">{r.summary}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Dlaczego pasuje: </span>
            {r.why}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{r.sourceName}</span>
            {r.organization && <span>{r.organization}</span>}
            <a
              href={r.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Źródło
              <ExternalLinkIcon className="size-3" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
