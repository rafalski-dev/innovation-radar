import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon, ExternalLinkIcon, ShuffleIcon } from "lucide-react";
import { ArticlesSection } from "@/components/landing/articles-section";
import { Bento } from "@/components/landing/bento";
import { Faq } from "@/components/landing/faq";
import { HeroRadar } from "@/components/landing/hero-radar";
import { HowItWorksCarousel } from "@/components/landing/how-it-works-carousel";
import { StructureSection } from "@/components/landing/structure-section";
import { ShinyLabel } from "@/components/landing/themed-react-bits";
import { TrlDetails } from "@/components/landing/trl-details";
import { ShareButtons } from "@/components/share-buttons";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { getInspirationAspects } from "@/queries/inspiration";
import { getActiveSources } from "@/queries/source";

const primaryCta =
  "group inline-flex items-center gap-3 rounded-full bg-brand py-1.5 pr-1.5 pl-6 text-sm font-medium text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand/90";
const secondaryCta =
  "inline-flex items-center gap-2 rounded-full border bg-card/60 px-6 py-3 text-sm font-medium transition-colors hover:bg-card";

const checks = ["Do 2 źródeł na aspekt", "Ocena TRL 1–9", "Raport do PDF"];

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold tracking-widest text-brand uppercase">{children}</p>;
}

export default async function Home() {
  const [session, sources, inspiration] = await Promise.all([
    getSession(),
    getActiveSources(),
    getInspirationAspects(),
  ]);

  return (
    <div className="space-y-24">
      <section className="relative isolate">
        <div className="relative isolate overflow-hidden rounded-3xl border">
          <HeroRadar />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--brand)_26%,transparent),transparent)]"
          />
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="relative z-10 space-y-6 px-4 py-20 text-center sm:py-28">
            <div className="mx-auto w-fit rounded-full border bg-card/60 px-4 py-1.5 text-sm backdrop-blur">
              <ShinyLabel>Dla firm, które szukają rozwiązań</ShinyLabel>
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-6xl">
              Transfer <em className="font-serif font-normal text-brand italic">innowacji</em> dla
              każdego
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Opisz swoje zapotrzebowanie. Agent AI przeszuka patenty, publikacje naukowe i projekty
              badawcze, a Ty dostaniesz dopasowane wyniki z uzasadnieniem, oceną gotowości
              technologicznej i linkiem do źródła.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {session ? (
                <Link href="/dashboard" className={primaryCta}>
                  Przejdź do panelu
                  <span className="flex size-9 items-center justify-center rounded-full bg-black/80 text-white">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link href="/register" className={primaryCta}>
                    Załóż konto
                    <span className="flex size-9 items-center justify-center rounded-full bg-black/80 text-white">
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </Link>
                  <Link href="/login" className={secondaryCta}>
                    Zaloguj się
                  </Link>
                </>
              )}
            </div>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              {checks.map((check) => (
                <li key={check} className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-brand" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-5 text-center">
        <p className="text-sm text-muted-foreground">Agent przeszukuje publiczne bazy</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {sources.map((source) => (
            <li key={source.slug}>
              <a
                href={`https://${source.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {source.name}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-4xl space-y-6">
        <Eyebrow>Problem</Eyebrow>
        <p className="text-2xl leading-snug font-medium tracking-tight text-muted-foreground sm:text-4xl">
          Rozwiązanie często <span className="text-foreground">już istnieje</span>, tylko leży w
          bazie, której nikt nie przeszukał. Horyzont robi to za Ciebie, a{" "}
          <span className="text-foreground">Ty decydujesz</span>, co zostaje.
        </p>
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Platforma</Eyebrow>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Poznaj potencjał{" "}
            <em className="font-serif font-normal text-brand italic">audytu innowacji</em> dla celów
            swojej organizacji
          </h2>
          <p className="text-muted-foreground">
            Jedno miejsce na opis projektu, frazy, źródła, wyniki i raport dla zespołu.
          </p>
        </div>
        <Bento />
        <TrlDetails />
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Struktura</Eyebrow>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Od organizacji do <em className="font-serif font-normal text-brand italic">raportu</em>
          </h2>
          <p className="text-muted-foreground">
            Horyzont porządkuje pracę w pięciu poziomach, które łączą wiele osób i wiele projektów.
          </p>
        </div>
        <StructureSection />
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Jak to działa</Eyebrow>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Od opisu do raportu w{" "}
            <em className="font-serif font-normal text-brand italic">pięciu</em> krokach
          </h2>
        </div>
        <HowItWorksCarousel />
      </section>

      {inspiration.length > 0 && (
        <section className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <Eyebrow>Inspiracje</Eyebrow>
            <h2 className="flex items-center gap-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Losowe aspekty <ShuffleIcon aria-hidden className="size-6 text-brand" />
            </h2>
            <p className="text-muted-foreground">
              Przykłady aspektów, które można zbadać w Horyzoncie. Odśwież stronę, żeby zobaczyć
              inne.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {inspiration.map((aspect) => (
              <li key={aspect.id} className="space-y-3 rounded-2xl border bg-card/60 p-4">
                <h3 className="font-medium">{aspect.title}</h3>
                {aspect.phrases.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {aspect.phrases.map((phrase) => (
                      <li
                        key={phrase}
                        className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {phrase}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="artykuly" className="scroll-mt-20 space-y-8">
        <div className="max-w-2xl space-y-3">
          <Eyebrow>Wiedza</Eyebrow>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Innowacje w <em className="font-serif font-normal text-brand italic">biznesie</em>
          </h2>
        </div>
        <ArticlesSection />
      </section>

      <section id="faq" className="scroll-mt-20 space-y-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Najczęstsze <em className="font-serif font-normal text-brand italic">pytania</em>
          </h2>
        </div>
        <Faq />
      </section>

      <section className="space-y-4 text-center">
        <h2 className="text-xl font-medium tracking-tight">Poleć Horyzont innowacji</h2>
        <p className="text-sm text-muted-foreground">
          Znasz firmę, której przyda się takie narzędzie? Podziel się linkiem.
        </p>
        <ShareButtons
          title="Horyzont innowacji: agent AI szuka gotowych innowacji dla Twojej firmy"
          className="justify-center"
        />
      </section>

      {!session && (
        <section className="relative isolate overflow-hidden rounded-3xl border px-6 py-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_50%_100%,color-mix(in_oklab,var(--brand)_28%,transparent),transparent)]"
          />
          <div className="mx-auto max-w-xl space-y-4">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Zacznij od{" "}
              <em className="font-serif font-normal text-brand italic">opisu projektu</em>
            </h2>
            <p className="text-sm text-muted-foreground">
              Konto wymaga tylko imienia, nazwiska, adresu e-mail i hasła.
            </p>
            <div className="pt-2">
              <Link href="/register" className={cn(primaryCta)}>
                Załóż konto
                <span className="flex size-9 items-center justify-center rounded-full bg-black/80 text-white">
                  <ArrowRightIcon className="size-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
