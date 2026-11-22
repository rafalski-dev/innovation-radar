import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { HelpWidget } from "@/components/help-widget";
import { Providers } from "@/components/providers";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Szeryfowa kursywa tylko do wyróżnienia słowa w nagłówkach stron publicznych.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
});

// Podgląd linku w social mediach (LinkedIn, Facebook, X): obraz z opengraph-image.jpg i twitter-image.jpg.
export const metadata: Metadata = {
  metadataBase: new URL(env.BETTER_AUTH_URL),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    title: `${site.name}: Transfer innowacji dla każdego`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: Transfer innowacji dla każdego`,
    description: site.description,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {/* tryby dostępności (daltonista, WCAG) nakładane przed pierwszym malowaniem, bez migotania */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;['cb','hc'].forEach(function(k){if(localStorage.getItem('a11y-'+k)==='1')d.classList.add(k)})}catch(e){}",
          }}
        />
      </head>
      <body className="theme-app flex min-h-full flex-col">
        <Providers>
          {children}
          <HelpWidget isLoggedIn={!!session} />
        </Providers>
      </body>
    </html>
  );
}
