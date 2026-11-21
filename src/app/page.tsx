import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/shadcn/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";

const steps = [
  { title: "Zgłoś", text: "Opisz pomysł lub wdrożone rozwiązanie w prostej karcie innowacji." },
  { title: "Ocena", text: "Urzędnik ocenia potencjał według jawnych kryteriów." },
  { title: "Rekomendacja", text: "Dostajesz rekomendowaną ścieżkę rozwoju z uzasadnieniem." },
  { title: "Partner", text: "Łączymy innowację z firmą, inwestorem lub instytucją." },
];

export default async function Home() {
  const session = await getSession();

  return (
    <div className="space-y-12">
      <section className="space-y-4 py-8 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight">
          Odkrywamy ukryte innowacje w szkołach, uczelniach i samorządach
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">{site.description}</p>
        <div className="flex justify-center gap-3 pt-2">
          {session ? (
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Przejdź do dashboardu
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardHeader>
              <div className="text-sm font-medium text-muted-foreground">Krok {index + 1}</div>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
