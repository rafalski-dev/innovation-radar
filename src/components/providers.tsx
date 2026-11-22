"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/shadcn/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // ciemny motyw jest domyślny, niezależnie od ustawień systemu; wybór przyciskiem zapamiętuje się w przeglądarce
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}
