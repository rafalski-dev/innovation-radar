import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Strony publiczne (landing, logowanie, rejestracja): nagłówek z linkami publicznymi i stopka.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter />
    </>
  );
}
