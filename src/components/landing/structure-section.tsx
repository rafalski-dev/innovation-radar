import {
  ArrowRightIcon,
  Building2Icon,
  FileTextIcon,
  FolderKanbanIcon,
  LayersIcon,
  SearchIcon,
} from "lucide-react";

const steps = [
  {
    icon: Building2Icon,
    title: "Organizacje",
    text: "Możesz tworzyć wiele organizacji i przypisywać do nich kolejne osoby.",
  },
  {
    icon: FolderKanbanIcon,
    title: "Projekty",
    text: "W organizacji możesz tworzyć wiele projektów. Wielu użytkowników może współtworzyć projekt, dodając do niego aspekty.",
  },
  {
    icon: LayersIcon,
    title: "Aspekty",
    text: "Projekt składa się z aspektów: osobnych wycinków problemu, dla których ustalasz frazy i źródła.",
  },
  {
    icon: SearchIcon,
    title: "Wyszukiwania",
    text: "Aspekt składa się z wyszukiwań. Ich wyniki możesz pobrać i opracować w raporcie.",
  },
  {
    icon: FileTextIcon,
    title: "Raport",
    text: "Zbiorcze opracowanie projektu w PDF, z oceną TRL i rekomendowanym następnym krokiem.",
  },
];

// Wyjaśnienie struktury radaru: organizacje → projekty → aspekty → wyszukiwania → raport.
export function StructureSection() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative flex flex-col gap-2 rounded-2xl border bg-card/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <step.icon className="size-4" />
            </span>
            {i < steps.length - 1 && (
              <ArrowRightIcon aria-hidden className="size-4 text-muted-foreground max-lg:hidden" />
            )}
          </div>
          <h3 className="font-medium">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
