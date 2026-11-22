"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";

// „Pobierz PDF”: otwiera okno drukowania przeglądarki (Zapisz jako PDF). Układ do druku jest w raporcie.
export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <PrinterIcon />
      Pobierz PDF
    </Button>
  );
}
