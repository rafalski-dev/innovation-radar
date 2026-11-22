// Liczniki przy projekcie: aspekty, wyniki, źródła (linki i pliki razem) i pliki PDF.
type Props = {
  need: {
    linkUrls: string[];
    files: unknown[];
    searches: { _count: { results: number } }[];
  };
};

export function NeedStats({ need }: Props) {
  const results = need.searches.reduce((sum, s) => sum + s._count.results, 0);
  const sources = need.linkUrls.length + need.files.length;
  const stats = [
    ["Aspekty", need.searches.length],
    ["Wyniki", results],
    ["Źródła", sources],
    ["Pliki PDF", need.files.length],
  ] as const;
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {stats.map(([label, value]) => (
        <div key={label} className="flex gap-1">
          <dt className="text-muted-foreground">{label}:</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
