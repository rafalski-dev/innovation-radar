"use client";

import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  PhrasesMock,
  ProjectMock,
  ReportMock,
  ResultsMock,
  SourcesMock,
} from "@/components/landing/slide-mocks";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Opisz projekt, AI pomoże go rozwinąć",
    text: "Dodajesz projekt w organizacji: tytuł, opis, do 3 linków i pliki PDF. Wystarczy kilka zdań, a AI zaproponuje uzupełnienia (cel, problem, ograniczenia), które jednym kliknięciem dopisujesz do opisu.",
    mock: <ProjectMock />,
  },
  {
    title: "Frazy do wyszukiwarki pod kontrolą",
    text: "AI proponuje 3–5 fraz na podstawie opisu dla danego aspektu projektu. Poprawiasz je, usuwasz, dodajesz kolejną z własną wskazówką i dopiero potem zatwierdzasz.",
    mock: <PhrasesMock />,
  },
  {
    title: "Wybierz źródła i liczbę wyników",
    text: "Zaznaczasz do dwóch źródeł (np. NCBiR, RAD-on) i wybierasz, ile wyników chcesz dostać. Agent szuka tylko tam, gdzie mu pozwolisz.",
    mock: <SourcesMock />,
  },
  {
    title: "Wyniki z uzasadnieniem i oceną TRL",
    text: "Każdy wynik ma opis, uzasadnienie „dlaczego pasuje”, link do źródła i poziom gotowości technologicznej (TRL 1–9). Odznaczasz te nieadekwatne, a gdy za mało, prosisz o więcej materiałów.",
    mock: <ResultsMock />,
  },
  {
    title: "Raport dla zespołu",
    text: "Z aspektów powstaje zbiorcze opracowanie projektu do zapisania jako PDF. Możesz wysłać je całej organizacji, a projekt zostaje zamknięty do edycji.",
    mock: <ReportMock />,
  },
];

// Karuzela „jak to działa”: przewijanie z przyciąganiem (scroll-snap), strzałki, kropki i klawiatura.
export function HowItWorksCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(slides.length - 1, Math.max(0, index));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div
      className="space-y-4"
      role="region"
      aria-roledescription="karuzela"
      aria-label="Jak to działa"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(active + 1);
        if (e.key === "ArrowLeft") goTo(active - 1);
      }}
    >
      <ul
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <li
            key={slide.title}
            aria-roledescription="slajd"
            aria-label={`${index + 1} z ${slides.length}`}
            className="w-full shrink-0 snap-center"
          >
            <div className="grid h-full gap-6 rounded-2xl border bg-card p-6 sm:p-10 md:grid-cols-2 md:items-center md:gap-10">
              <div className="space-y-3">
                <p className="text-sm font-medium text-brand">
                  Krok {index + 1} z {slides.length}
                </p>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{slide.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{slide.text}</p>
              </div>
              <div
                aria-hidden
                className="rounded-xl border bg-muted/40 p-4 shadow-sm select-none sm:p-5"
              >
                {slide.mock}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
        >
          <ChevronLeftIcon />
          <span className="sr-only">Poprzedni slajd</span>
        </Button>
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Przejdź do slajdu ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "h-2 rounded-full transition-all",
                index === active ? "w-6 bg-brand" : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => goTo(active + 1)}
          disabled={active === slides.length - 1}
        >
          <ChevronRightIcon />
          <span className="sr-only">Następny slajd</span>
        </Button>
      </div>
    </div>
  );
}
