import Link from "next/link";
import {
  ArrowRightIcon,
  BookmarkIcon,
  FileTextIcon,
  MessageSquareIcon,
  PencilLineIcon,
  SearchCheckIcon,
  SendIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/shadcn/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { getSession } from "@/lib/session";

const steps = [
  {
    icon: PencilLineIcon,
    title: "Opisz, czego potrzebujesz",
    text: "Podaj oczekiwany efekt i swoje zapotrzebowanie. Możesz działać jako firma albo indywidualnie.",
  },
  {
    icon: MessageSquareIcon,
    title: "Doprecyzuj w rozmowie",
    text: "Asystent zadaje pytania pomocnicze, żeby opis był na tyle konkretny, by dało się go dopasować.",
  },
  {
    icon: SearchCheckIcon,
    title: "Dostań dopasowane wyniki",
    text: "Agent przeszukuje źródła publiczne i pokazuje wyniki wraz z uzasadnieniem. Historia wyszukiwań jest zapamiętana.",
  },
  {
    icon: BookmarkIcon,
    title: "Zapisz do list tematycznych",
    text: "Dodawaj wyniki do ulubionych albo do list przypisanych do konkretnych projektów.",
  },
  {
    icon: SendIcon,
    title: "Skontaktuj się i oceń kontakt",
    text: "Napisz do autorów rozwiązań. Po dniu i po miesiącu poprosimy Cię o krótką informację zwrotną.",
  },
  {
    icon: FileTextIcon,
    title: "Wygeneruj raport",
    text: "Z listy tematycznej powstaje raport z wybranymi rozwiązaniami i uzasadnieniem.",
  },
];

const sources = [
  { name: "Patenty UPRP", text: "Urząd Patentowy RP" },
  { name: "Patenty EPO", text: "Europejski Urząd Patentowy" },
  { name: "Publikacje naukowe", text: "PBN, PPM, BazTech" },
  { name: "Projekty UE", text: "Interreg" },
  { name: "Projekty NCBiR", text: "Wyszukiwarka sukcesów beneficjentów" },
];

export default async function Home() {
  const session = await getSession();

  return (
    <div className="space-y-16">
      <section className="space-y-5 py-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">Dla firm szukających rozwiązań</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Znajdź gotową innowację, zanim zbudujesz ją od zera
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Opisz swoje zapotrzebowanie. Agent AI przeszuka patenty, publikacje naukowe i projekty
          badawcze, a Ty dostaniesz dopasowane wyniki z uzasadnieniem i kontaktem do autorów.
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
      </section>

      <section className="space-y-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">Jak to działa</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <step.icon className="size-4" />
                  Krok {index + 1}
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Skąd bierzemy dane</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Nie przeszukujemy zgłoszeń użytkowników platformy. Agent zbiera i porządkuje informacje
            z publicznych baz.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sources.map((source) => (
            <div key={source.name} className="rounded-lg border p-4 text-sm">
              <div className="font-medium">{source.name}</div>
              <div className="text-xs text-muted-foreground">{source.text}</div>
            </div>
          ))}
        </div>
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
