import { ChevronDownIcon } from "lucide-react";
import { faq } from "@/lib/content";

// Sekcja FAQ: pytania rozwijane natywnym <details> (działa bez JavaScriptu).
export function Faq() {
  return (
    <ul className="mx-auto grid max-w-3xl gap-2">
      {faq.map((item) => (
        <li key={item.question}>
          <details className="group rounded-2xl border bg-card/60">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
