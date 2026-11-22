import Link from "next/link";
import {
  ArrowRightIcon,
  BuildingIcon,
  FileTextIcon,
  GaugeIcon,
  PencilLineIcon,
  SearchCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { HeroRadar } from "@/components/landing/hero-radar";
import { HowItWorksCarousel } from "@/components/landing/how-it-works-carousel";
import { BrandGradientText, FeatureCard, ShinyLabel } from "@/components/landing/themed-react-bits";
import { buttonVariants } from "@/components/shadcn/button";
import { getSession } from "@/lib/session";
import { getActiveSources } from "@/queries/source";

const features = [
  {
    icon: BuildingIcon,
    title: "Organizacje i zespół",
    text: "Prowadź projekty w imieniu firmy i dodawaj do niej osoby. Cały zespół widzi te same projekty i aspekty.",
  },
  {
    icon: PencilLineIcon,
    title: "Projekty z materiałami",
    text: "Opis, do 3 linków i pliki PDF w jednym miejscu. Każdy projekt ma własny numer, a AI pomaga rozwinąć opis.",
  },
  {
    icon: SparklesIcon,
    title: "Frazy pod kontrolą",
    text: "AI proponuje frazy do wyszukiwarki, a Ty je poprawiasz, dopisujesz kolejne z własną wskazówką i zatwierdzasz.",
  },
  {
    icon: SearchCheckIcon,
    title: "Aspekty i wybór źródeł",
    text: "Jeden projekt, wiele aspektów. Do każdego wybierasz do dwóch źródeł i liczbę wyników, a nieadekwatne odznaczasz.",
  },
  {
    icon: GaugeIcon,
    title: "Ocena gotowości (TRL)",
    text: "Przy każdym wyniku skala gotowości technologicznej 1–9, oceniana wyłącznie na podstawie opisu w źródle.",
  },
  {
    icon: FileTextIcon,
    title: "Raport do PDF",
    text: "Zbiorcze opracowanie projektu z wszystkimi aspektami i wynikami. Możesz je wysłać zespołowi.",
  },
];

export default async function Home() {
  const [session, sources] = await Promise.all([getSession(), getActiveSources()]);

  return (
    <div className="space-y-20">
      <section className="relative isolate overflow-hidden rounded-3xl border">
        <HeroRadar />
        <div className="relative z-10 space-y-5 px-4 py-20 text-center sm:py-32">
          <p className="text-sm font-medium">
            <ShinyLabel>Dla firm szukających rozwiązań</ShinyLabel>
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Znajdź <BrandGradientText>gotową innowację</BrandGradientText>, zanim zbudujesz ją od
            zera
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Opisz swoje zapotrzebowanie. Agent AI przeszuka patenty, publikacje naukowe i projekty
            badawcze, a Ty dostaniesz dopasowane wyniki z uzasadnieniem, oceną gotowości
            technologicznej i linkiem do źródła.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {session ? (
              <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
                Przejdź do panelu
                <ArrowRightIcon />
              </Link>
            ) : (
              <>
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  Załóż konto
                </Link>
                <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
                  Zaloguj się
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Zobacz, jak to działa</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Od opisu projektu do raportu dla zespołu w pięciu krokach. Przewiń strzałkami albo
            palcem.
          </p>
        </div>
        <HowItWorksCarousel />
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">Co dostajesz</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title}>
              <div className="space-y-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </div>
            </FeatureCard>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Skąd bierzemy dane</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Nie przeszukujemy zgłoszeń użytkowników platformy. Agent zbiera i porządkuje informacje
            z publicznych baz, a kolejne źródła dodaje administrator.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((source) => (
            <div key={source.slug} className="rounded-lg border p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <span className="size-2 rounded-full bg-brand-green" />
                {source.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{source.description}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          W planach: patenty UPRP i EPO oraz publikacje (PBN, PPM, BazTech).
        </p>
      </section>

      {!session && (
        <section className="space-y-4 rounded-xl border bg-muted/40 px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Zacznij od opisu projektu</h2>
          <p className="text-sm text-muted-foreground">
            Konto wymaga tylko imienia, nazwiska, adresu e-mail i hasła.
          </p>
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Załóż konto
          </Link>
        </section>
      )}
    </div>
  );
}
