import Link from "next/link";
import { Button } from "@/components/shadcn/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Nie znaleziono strony</h2>
      <p className="text-sm text-muted-foreground">Ta strona nie istnieje albo została usunięta.</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Wróć na start
      </Button>
    </div>
  );
}
