# 📡 Radar innowacji

Radar innowacji to platforma dla firm i instytucji, które szukają gotowych rozwiązań i partnerów dla swoich problemów. Powstała jako prototyp hackathonowy PCI. Użytkownik opisuje problem, AI proponuje frazy do wyszukiwarki, a agent przeszukuje publiczne bazy (obecnie NCBiR i RAD-on) i pokazuje listę wyników z uzasadnieniem dopasowania, oceną gotowości technologicznej (TRL) i linkiem do źródła.

🔗 **Podgląd na żywo:** https://innovation-radar-three.vercel.app/

## 🛠️ Stack technologiczny

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_Postgres-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

| Warstwa                    | Technologie                                      |
| -------------------------- | ------------------------------------------------ |
| **Framework**              | Next.js 16 (App Router), React 19, TypeScript    |
| **Style i komponenty**     | Tailwind CSS 4, shadcn (Base UI), Lucide         |
| **Baza danych**            | Prisma 7 + Neon (PostgreSQL)                     |
| **Uwierzytelnianie**       | Better Auth (e-mail i hasło, weryfikacja adresu) |
| **Formularze i walidacja** | React Hook Form + Zod 4                          |
| **AI i agent**             | Claude API (Haiku) z narzędziem `web_search`     |
| **Pliki**                  | Cloudflare R2 (PDF, podpisane adresy)            |
| **E-mail**                 | Resend                                           |
| **Narzędzia**              | React Compiler, ESLint, Prettier                 |
| **Hosting**                | Vercel                                           |

## ✨ Funkcje

- 🏢 **Organizacje i osoby** — konta, organizacje (NIP, adres, branża), dodawanie osób z istniejącymi kontami, role administratora i członka
- 📁 **Projekty** — opis problemu firmy, do 3 linków i do 3 plików PDF (po 20 MB), numeracja projektów, duplikowanie
- ✍️ **Asystent opisu** — AI proponuje uzupełnienia opisu projektu, a użytkownik dodaje wybrane jednym kliknięciem
- 🔤 **Generowanie fraz** — 3–5 fraz do wyszukiwarki po polsku, edytowalnych i zatwierdzanych przez człowieka
- 🤖 **Agent wyszukujący** — przeszukuje wybrane źródła i zwraca wyniki z uzasadnieniem, oceną TRL i linkiem pochodzącym z faktycznych wyników wyszukiwania
- ➕ **„Znajdź więcej” i filtry** — wybór liczby wyników i źródeł, dokładanie kolejnych materiałów bez powtórzeń
- 🗂️ **Aspekty i historia** — zatwierdzone wyszukiwania zapisują się razem z frazami; te same frazy w ciągu 7 dni wracają z zapisu bez kosztu
- 📊 **Raport projektu** — zbiorcze opracowanie do druku lub PDF, wysyłane e-mailem do członków organizacji (po wysłaniu projekt jest zamknięty do edycji)
- 🛡️ **Panel administratora** — źródła wyszukiwania, czarne listy (e-maile i tematy), limity i dodatkowe wytyczne dla AI
- 💸 **Kontrola kosztów** — limity uruchomień agenta i generowań na użytkownika oraz tryb testowy `AGENT_MOCK`
- 📱 **Responsywny interfejs** — jasny i ciemny motyw, strona główna z animowanym radarem

## 🧠 Studium przypadku

Celem było zbudowanie działającego prototypu, w którym firma przechodzi całą drogę: od opisu problemu, przez frazy, po listę gotowych rozwiązań z linkami do źródeł.

### Człowiek decyduje, AI proponuje

Każdy etap AI jest tylko propozycją. Frazy użytkownik edytuje i zatwierdza, listę wyników odznacza, a dopiero potem zapisuje. Wyniki nie są zapisywane przy generowaniu, tylko przy zatwierdzeniu aspektu.

### Wiarygodne wyniki

Agent szuka wyłącznie w domenach wskazanych źródeł. Serwer porównuje linki zwrócone przez model z adresami, które naprawdę zwróciło wyszukiwanie, i odrzuca resztę. Dzięki temu model nie może podać zmyślonego linku.

### Koszty pod kontrolą

Model Haiku, ograniczona liczba wyszukań, limity na użytkownika w oknie 30 minut, cache wyników na 7 dni i wymuszone odpowiedzi w formacie JSON (narzędzia ze schematem Zod) utrzymują koszt pojedynczego uruchomienia na niskim poziomie.

### Pliki i bezpieczeństwo

Pliki PDF trafiają prosto z przeglądarki do prywatnego bucketu R2 przez krótko ważne podpisane adresy. Serwer sprawdza potem rozmiar i sygnaturę pliku. Każda akcja serwerowa weryfikuje sesję i dostęp do organizacji, a rola administratora jest sprawdzana po stronie serwera.

## 🧪 Dla jury: jak wypróbować

1. Wejdź na działający prototyp: **https://innovation-radar-three.vercel.app/**
2. Zaloguj się kontem testowym:

   | Pole   | Wartość          |
   | ------ | ---------------- |
   | E-mail | `test@gmail.com` |
   | Hasło  | `Mini12345!`     |

3. Możesz też założyć własne konto (rejestracja na stronie głównej).

Co sprawdzić po zalogowaniu:

- **Organizacje**: dodanie firmy i osób do organizacji.
- **Projekty**: opis problemu, linki i pliki PDF.
- **Aspekt** (`Aspekty → Nowy aspekt`): wybierz projekt, wygeneruj i zatwierdź frazy, kliknij „Szukaj w źródłach” (do minuty), a potem zatwierdź listę wyników.
- **Raport**: w projekcie otwórz raport i wyślij go do członków organizacji.

## 📋 Status funkcji z planu

| #   | Funkcja                                                             | Status    | Co jest w prototypie                                                                  |
| --- | ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| 1   | Panel rejestracji organizacji i użytkowników                        | gotowe    | konta, organizacje, osoby w organizacji, projekty z linkami i PDF                     |
| 2   | Asystent formułowania problematyki badawczej                        | częściowo | AI uzupełnia opis i wnioskuje frazy (bez czatu z pytaniami pomocniczymi)              |
| 3   | Rekomendacje rozbicia problemów na aspekty                          | planowane | aspekty tworzy użytkownik, bez rekomendacji                                           |
| 4   | Rekomendacje rozbicia aspektów na proponowane wyszukania w bazach   | częściowo | 3–5 fraz, edytowalnych i zatwierdzanych przez użytkownika                             |
| 5   | Moduł dodawania źródeł do wyszukiwań                                | gotowe    | administrator zarządza źródłami w panelu, użytkownik wybiera do 2 na wyszukanie       |
| 6   | Ocena przydatności materiałów w kontekście wyszukiwań               | częściowo | uzasadnienie „dlaczego pasuje” i ocena TRL (bez oceny punktowej)                      |
| 7   | Zautomatyzowany raport dla problemu (aspekty, wyszukiwania, źródła) | gotowe    | raport zbiorczy projektu do druku i PDF, wysyłka e-mailem                             |
| 8   | Dzielenie się wynikami z innymi podmiotami i kontakt w konsultacji  | częściowo | osoby w organizacji współdzielą projekty i raport, bez udostępniania na zewnątrz      |
| 9   | Alerty o nowych materiałach pasujących do zapytania                 | planowane | brak                                                                                  |
| 10  | Własny zbiór opracowań (zapis analiz AI, bez ponownej weryfikacji)  | częściowo | zatwierdzone aspekty zapisują się w historii, a te same frazy wracają z cache (7 dni) |
| 11  | Regularne wypuszczanie nowych wersji                                | w trakcie | wdrożenie z gałęzi `main` na Vercel po każdej zmianie                                 |

Szczegóły: [`docs/PROJECT.md`](docs/PROJECT.md), plan agenta: [`docs/AGENT.md`](docs/AGENT.md), wytyczne organizatorów: [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

## ⚙️ Uruchomienie lokalne

### Wymagania

- [Node.js](https://nodejs.org/) 20+ i npm
- Baza PostgreSQL, np. darmowa na [Neon](https://neon.tech/)
- Opcjonalnie: klucz [Anthropic](https://console.anthropic.com/) (agent i frazy), konto [Resend](https://resend.com/) (e-maile) i bucket Cloudflare R2 (pliki PDF)

### Instalacja

**1. Sklonuj repozytorium**

```bash
git clone https://github.com/rafalski-dev/innovation-radar.git
cd innovation-radar
```

**2. Zainstaluj zależności** (generuje też klienta Prismy)

```bash
npm install
```

**3. Ustaw zmienne środowiskowe**

Skopiuj `.env.example` do `.env` i uzupełnij:

```env
# Wymagane
DATABASE_URL=postgresql://...            # connection string z Neona
BETTER_AUTH_SECRET=...                   # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Opcjonalne
ADMIN_EMAILS=ty@example.com              # konta z tym adresem dostają rolę ADMIN
ANTHROPIC_API_KEY=...                    # bez klucza agent i frazy nie działają
AGENT_MOCK=true                          # przykładowe wyniki bez wywołań API
RESEND_API_KEY=...                       # bez klucza linki trafiają do konsoli serwera
R2_ACCOUNT_ID=...                        # pliki PDF (R2_*)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
```

> Bez `RESEND_API_KEY` aplikacja działa: link weryfikacyjny i reset hasła wypisują się w konsoli serwera. Bez zmiennych `R2_*` wyłączone jest tylko dodawanie plików PDF.

**4. Utwórz tabele i dane testowe**

```bash
npm run db:push
npm run db:seed
```

**5. Uruchom serwer deweloperski**

```bash
npm run dev
```

Aplikacja działa pod adresem **http://localhost:3000**.

### Skrypty

`dev`, `build`, `typecheck`, `lint`, `format`, `db:push`, `db:seed`, `db:studio`. Zasady kodu: [`CLAUDE.md`](CLAUDE.md).
