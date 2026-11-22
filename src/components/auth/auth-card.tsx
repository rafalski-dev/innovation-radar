import type { ReactNode } from "react";
import { RadarIcon } from "lucide-react";

// Wspólna oprawa stron logowania, rejestracji i resetu hasła: poświata i siatka w tle,
// karta z pomarańczowym akcentem, a w tytule kursywa szeryfowa (jak na stronie głównej).
export function AuthCard({
  title,
  accent,
  description,
  children,
}: {
  title?: string;
  accent: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate mx-auto w-full max-w-md py-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] -top-24 -z-10 h-96 bg-[radial-gradient(50%_60%_at_50%_0%,color-mix(in_oklab,var(--brand)_24%,transparent),transparent)]"
      />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="space-y-6 rounded-3xl border bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
              <RadarIcon className="size-5" />
            </span>
            <h1 className="text-3xl font-medium tracking-tight">
              {title && <>{title} </>}
              <span className="text-brand">{accent}</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// Klasy przycisków na stronach auth: pomarańczowa pigułka jak w sekcji hero.
export const authSubmitClass =
  "h-10 w-full rounded-full bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand/90 dark:bg-brand dark:text-white";
