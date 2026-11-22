"use client";

import { useEffect, useRef } from "react";
import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { reportFileName } from "@/lib/report-file-name";

// „Pobierz PDF”: otwiera okno drukowania przeglądarki (Zapisz jako PDF). Układ do druku jest w raporcie.
// Domyślna nazwa zapisywanego pliku to tytuł strony, więc na czas drukowania ustawiamy go na
// „Projekt_<tytuł projektu>_<data i godzina>” (także przy wydruku skrótem Ctrl+P) i przywracamy po wydruku.
export function PrintButton({ projectTitle }: { projectTitle: string }) {
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    function applyTitle() {
      if (originalTitle.current === null) originalTitle.current = document.title;
      document.title = reportFileName(projectTitle, new Date());
    }
    function restoreTitle() {
      if (originalTitle.current !== null) document.title = originalTitle.current;
      originalTitle.current = null;
    }
    window.addEventListener("beforeprint", applyTitle);
    window.addEventListener("afterprint", restoreTitle);
    return () => {
      window.removeEventListener("beforeprint", applyTitle);
      window.removeEventListener("afterprint", restoreTitle);
      restoreTitle();
    };
  }, [projectTitle]);

  return (
    <Button
      onClick={() => {
        // tytuł ustawiamy też tu, bo nie każda przeglądarka wysyła beforeprint przed window.print()
        if (originalTitle.current === null) originalTitle.current = document.title;
        document.title = reportFileName(projectTitle, new Date());
        window.print();
      }}
    >
      <PrinterIcon />
      Pobierz PDF
    </Button>
  );
}
