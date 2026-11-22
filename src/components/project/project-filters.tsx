"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

type Props = { organizations: { id: string; name: string }[] };

const SELECT_CLASS =
  "h-8 w-full appearance-none rounded-lg border border-input bg-transparent pr-8 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

// Wyszukiwanie i filtry listy projektów. Stan leży w adresie URL (q, org), filtruje serwer.
export function ProjectFilters({ organizations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // opóźnienie, żeby nie odpytywać serwera przy każdej literze
  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update("q", query.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const active = params.has("q") || params.has("org");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj: tytuł, opis, autor, baza…"
          className="pl-8"
          aria-label="Szukaj projektów"
        />
      </div>
      {organizations.length > 1 && (
        <div className="relative">
          <select
            className={SELECT_CLASS}
            value={params.get("org") ?? ""}
            onChange={(e) => update("org", e.target.value)}
            aria-label="Organizacja"
          >
            <option value="">Wszystkie organizacje</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      )}
      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuery("");
            router.replace(pathname, { scroll: false });
          }}
        >
          <XIcon />
          Wyczyść
        </Button>
      )}
    </div>
  );
}
