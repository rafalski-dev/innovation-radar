import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { articles } from "@/lib/content";

// Zajawki artykułów AI na stronie głównej.
export function ArticlesSection() {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link
            href={`/artykuly/${article.slug}`}
            className="group flex h-full flex-col gap-3 rounded-2xl border bg-card/60 p-6 transition-colors hover:bg-card"
          >
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-brand uppercase">
              <SparklesIcon className="size-3.5" />
              Artykuł AI · {article.readingMinutes} min
            </p>
            <h3 className="text-xl font-medium tracking-tight">{article.title}</h3>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{article.lead}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
              Czytaj
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
