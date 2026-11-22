// Liczniki przy projekcie: aspekty, wyniki, źródła (linki i pliki razem) i pliki PDF.
type Props = {
  project: {
    linkUrls: string[];
    files: unknown[];
    searches: { _count: { results: number } }[];
  };
};

export function ProjectStats({ project }: Props) {
  const results = project.searches.reduce((sum, s) => sum + s._count.results, 0);
  const sources = project.linkUrls.length + project.files.length;
  const stats = [
    ["Aspekty", project.searches.length],
    ["Wyniki", results],
    ["Źródła", sources],
    ["Pliki PDF", project.files.length],
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
