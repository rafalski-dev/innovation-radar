import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

// Stopka stron publicznych: informacja o inicjatywie, logo PCI i podstawowe linki.
export function SiteFooter() {
  return (
    <footer className="mt-8">
      <div className="h-px bg-gradient-to-r from-transparent via-brand-blue/60 to-transparent" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1.6fr_auto] md:items-center">
        <div className="space-y-2">
          <p className="font-semibold">{site.name}</p>
          <p className="text-sm text-muted-foreground">
            Agent AI, który szuka gotowych innowacji, patentów i projektów badawczych dla Twojej
            firmy.
          </p>
          <nav className="flex gap-4 pt-1 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Zaloguj się
            </Link>
            <Link href="/register" className="text-muted-foreground hover:text-foreground">
              Załóż konto
            </Link>
          </nav>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Aplikacja powstała z inicjatywy{" "}
          <span className="font-medium text-foreground">HackNation 2026 w Bydgoszczy</span> oraz{" "}
          <a
            href="https://pcinn.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-brand-green decoration-2 underline-offset-4 hover:decoration-brand-blue"
          >
            Podkarpackiego Centrum Innowacji
          </a>
          .
        </p>

        <a
          href="https://pcinn.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Podkarpackie Centrum Innowacji (otwiera pcinn.org)"
          className="justify-self-start rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md md:justify-self-end"
        >
          <Image
            src="/pci-logo.svg"
            alt="Logo Podkarpackiego Centrum Innowacji"
            width={1206}
            height={310}
            className="h-9 w-auto"
          />
        </a>
      </div>
      <div className="border-t">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © 2026 {site.name} · HackNation 2026, Bydgoszcz
        </p>
      </div>
    </footer>
  );
}
