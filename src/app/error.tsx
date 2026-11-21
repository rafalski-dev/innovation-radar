"use client";

import { useEffect } from "react";
import { Button } from "@/components/shadcn/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Coś poszło nie tak</h2>
      <p className="text-sm text-muted-foreground">
        Nie udało się załadować tej strony. Spróbuj ponownie za chwilę.
      </p>
      <Button onClick={() => retry()}>Spróbuj ponownie</Button>
    </div>
  );
}
