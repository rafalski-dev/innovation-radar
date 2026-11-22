import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import { AI_NOTE, articles, getArticle } from "@/lib/content";

// nieznany adres artykułu od razu zwraca 404 (bez renderowania strony)
export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/artykuly/[slug]">): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return article ? { title: article.title, description: article.lead } : {};
}

export default async function ArticlePage({ params }: PageProps<"/artykuly/[slug]">) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/#artykuly"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Strona główna
      </Link>
      <header className="space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-brand uppercase">
          <SparklesIcon className="size-3.5" />
          Artykuł AI · {article.readingMinutes} min czytania
        </p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{article.title}</h1>
        <p className="text-lg text-muted-foreground">{article.lead}</p>
        <ShareButtons title={article.title} />
      </header>
      {article.sections.map((section) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-xl font-medium tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="rounded-xl border bg-card/60 p-4 text-xs text-muted-foreground">{AI_NOTE}</p>
    </article>
  );
}
