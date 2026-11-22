// Treści statyczne strony głównej: FAQ i artykuły. Kod po angielsku, teksty po polsku.
export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: "Czym jest Radar innowacji?",
    answer:
      "To aplikacja, w której opisujesz swoje zapotrzebowanie, a agent AI przeszukuje wskazane publiczne bazy (patenty, publikacje, projekty badawcze). Każdy wynik dostaje uzasadnienie, ocenę gotowości technologicznej (TRL) i link do źródła.",
  },
  {
    question: "Skąd Radar bierze wyniki?",
    answer:
      "Wyłącznie z publicznych baz, które widzisz na stronie głównej i w formularzu aspektu. Dla jednego aspektu wybierasz do dwóch źródeł, a agent szuka tylko tam, gdzie mu pozwolisz.",
  },
  {
    question: "Czy AI może się mylić?",
    answer:
      "Tak. Dlatego przy każdym wyniku jest link do źródła, a frazy wyszukiwania sam zatwierdzasz. Wyników bywa mniej niż limit, bo agent zwraca tylko materiały, których adres potwierdziło wyszukiwanie. Zawsze sprawdź źródło, zanim podejmiesz decyzję.",
  },
  {
    question: "Co to jest TRL i jak go oceniacie?",
    answer:
      "TRL (Technology Readiness Level) to skala gotowości technologicznej od 1 (podstawowe zasady) do 9 (system sprawdzony w eksploatacji). Gdy agent nie potrafi ocenić poziomu ze źródła, liczymy wynik jako TRL 2 i pokazujemy to w raporcie.",
  },
  {
    question: "Czym różni się projekt od aspektu?",
    answer:
      "Projekt opisuje całe zapotrzebowanie. Aspekt to jeden jego wycinek (np. magazynowanie energii), dla którego zatwierdzasz frazy, wybierasz źródła i uruchamiasz wyszukiwanie. Projekt składa się z aspektów.",
  },
  {
    question: "Kto może współtworzyć projekt?",
    answer:
      "Do organizacji możesz przypisać kolejne osoby. Wielu użytkowników współtworzy projekt, dodając do niego własne aspekty. Możesz też tworzyć wiele organizacji i wiele projektów.",
  },
  {
    question: "Co się dzieje po wysłaniu raportu?",
    answer:
      "Raport trafia do członków organizacji, a projekt zostaje zamknięty do edycji (zostaje możliwość jego zduplikowania). Raport możesz też w każdej chwili pobrać jako plik PDF.",
  },
  {
    question: "Jak zgłosić błąd albo propozycję?",
    answer:
      "Przyciskiem „Pomoc” w prawym dolnym rogu każdej strony. Możesz zgłosić problem z radarem, problem ze źródłem lub zaproponować zmianę.",
  },
];

export type ArticleSection = { heading: string; paragraphs: string[] };
export type Article = {
  slug: string;
  title: string;
  lead: string;
  readingMinutes: number;
  sections: ArticleSection[];
};

export const AI_NOTE =
  "Artykuł przygotowano z pomocą AI. Ma charakter ogólny i informacyjny, nie jest poradą prawną, podatkową ani finansową. Warunki programów i przepisów zmieniają się, więc przed decyzją sprawdź aktualne źródła.";

export const articles: Article[] = [
  {
    slug: "korzysci-z-innowacji-w-biznesie",
    title: "Dlaczego innowacje się opłacają: korzyści dla biznesu",
    lead: "Innowacja to nie tylko laboratoria i patenty. To każda zmiana produktu, procesu lub modelu działania, która daje firmie przewagę. Oto, co realnie zyskuje organizacja, która ją wdraża.",
    readingMinutes: 4,
    sections: [
      {
        heading: "Przewaga konkurencyjna",
        paragraphs: [
          "Firma, która szybciej niż rynek poprawia swoje produkty i procesy, trudniej wchodzi w wojnę cenową. Klienci płacą za rozwiązanie, które działa lepiej, taniej w użyciu albo rozwiązuje problem, którego konkurencja nie ruszyła.",
          "Innowacja nie musi być przełomowa. Często wystarczy sprawdzona technologia zastosowana w nowym miejscu, na przykład wizyjna kontrola jakości na linii, która wcześniej wymagała wielu pracowników.",
        ],
      },
      {
        heading: "Niższe koszty i większa efektywność",
        paragraphs: [
          "Automatyzacja, lepsze zarządzanie energią czy odzysk surowców zmniejszają koszty stałe. To zwykle najszybciej mierzalna korzyść: da się ją policzyć w oszczędności na jednostkę produktu, w krótszym czasie realizacji lub mniejszej liczbie reklamacji.",
        ],
      },
      {
        heading: "Nowe produkty i nowe rynki",
        paragraphs: [
          "Rozwiązania opracowane na własne potrzeby bywają produktem samym w sobie. Innowacja otwiera też drogę do klientów, którzy wcześniej byli poza zasięgiem, na przykład dzięki spełnieniu norm środowiskowych lub nowej technologii wytwarzania.",
        ],
      },
      {
        heading: "Odporność na zmiany",
        paragraphs: [
          "Regulacje, ceny energii i oczekiwania klientów zmieniają się szybciej niż kiedyś. Organizacja przyzwyczajona do wprowadzania usprawnień łatwiej się dostosowuje i rzadziej traci pozycję z dnia na dzień.",
        ],
      },
      {
        heading: "Ludzie i partnerzy",
        paragraphs: [
          "Innowacyjne firmy łatwiej przyciągają zdolnych pracowników i partnerów naukowych. Współpraca z uczelnią lub instytutem badawczym daje dostęp do wiedzy, sprzętu i finansowania, których firma nie ma u siebie.",
        ],
      },
      {
        heading: "Nie musisz budować od zera",
        paragraphs: [
          "Wiele rozwiązań już istnieje w publicznych bazach patentów, publikacji i projektów badawczych, tylko nikt ich nie przeszukał. Zanim zainwestujesz w własne prace, sprawdź, co jest gotowe i na jakim etapie dojrzałości (skala TRL 1–9). Wynik na wysokim poziomie TRL można wdrożyć szybciej, a ten na niskim da się rozwijać razem z partnerem naukowym.",
        ],
      },
    ],
  },
  {
    slug: "finansowanie-innowacji-w-biznesie",
    title: "Jak sfinansować innowacje w firmie",
    lead: "Pomysł na innowację to połowa drogi. Druga to pieniądze. Przegląd głównych źródeł finansowania, od dotacji i ulg podatkowych po kapitał prywatny, oraz wskazówka, jak dobrać je do etapu rozwoju technologii.",
    readingMinutes: 5,
    sections: [
      {
        heading: "Dotacje krajowe i unijne",
        paragraphs: [
          "Najczęściej wykorzystywane są konkursy Narodowego Centrum Badań i Rozwoju (NCBR), Polskiej Agencji Rozwoju Przedsiębiorczości (PARP) oraz regionalne programy Funduszy Europejskich. Finansują prace badawczo-rozwojowe, wdrożenia i inwestycje w nowe technologie, zwykle z udziałem własnym firmy.",
          "Warto też sprawdzić programy europejskie, takie jak Horyzont Europa. Są bardziej wymagające formalnie, ale dają duże budżety i kontakty z partnerami z innych krajów.",
        ],
      },
      {
        heading: "Ulgi podatkowe",
        paragraphs: [
          "Firmy prowadzące działalność badawczo-rozwojową mogą skorzystać z ulgi na B+R, która pozwala odliczyć część poniesionych kosztów od podstawy opodatkowania. Kolejne rozwiązania to preferencyjna stawka od dochodów z kwalifikowanych praw własności intelektualnej (IP Box) oraz ulgi związane z robotyzacją czy prototypem.",
          "Ulgi nie wymagają konkursu, ale wymagają dobrej dokumentacji prac i kosztów. Zasady bywają zmieniane, dlatego omów je z doradcą podatkowym.",
        ],
      },
      {
        heading: "Finansowanie dłużne",
        paragraphs: [
          "Kredyty i pożyczki, w tym instrumenty z gwarancjami lub dopłatami (np. oferowane przez Bank Gospodarstwa Krajowego), sprawdzają się przy wdrożeniach, gdy technologia jest już dojrzała i da się policzyć zwrot z inwestycji.",
        ],
      },
      {
        heading: "Kapitał prywatny",
        paragraphs: [
          "Aniołowie biznesu i fundusze venture capital wchodzą w projekty o dużym potencjale wzrostu, zwykle w zamian za udziały. Do mniejszych inicjatyw można rozważyć finansowanie społecznościowe. To droga dla firm, które chcą szybko skalować produkt i akceptują współdecydowanie inwestora.",
        ],
      },
      {
        heading: "Współpraca z nauką",
        paragraphs: [
          "Wspólny projekt z uczelnią lub instytutem badawczym obniża koszt prac, bo część infrastruktury i zespołu jest po stronie partnera. Wiele konkursów premiuje lub wręcz wymaga takiego konsorcjum.",
        ],
      },
      {
        heading: "Jak dobrać źródło do etapu TRL",
        paragraphs: [
          "Na niskich poziomach gotowości (TRL 1–3) najlepiej pasują granty badawcze i współpraca z nauką. Przy prototypie (TRL 4–6) sięga się po dotacje na prace rozwojowe i ulgi podatkowe. Wdrożenie (TRL 7–9) finansuje się częściej kredytem, inwestorem lub dotacją inwestycyjną.",
          "Zanim złożysz wniosek, zbierz dowody dojrzałości technologii: wyniki badań, opisy prototypów i linki do źródeł. Raport z Radaru innowacji z oceną TRL każdego wyniku ułatwia to przygotowanie.",
        ],
      },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
