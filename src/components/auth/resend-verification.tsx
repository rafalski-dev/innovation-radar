"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { authClient } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 60;

// Ponowna wysyłka linku weryfikacyjnego. Gdy adresu nie ma w URL, pozwala go wpisać.
export function ResendVerification({ email: initialEmail }: { email?: string }) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function resend() {
    startTransition(async () => {
      const { error } = await authClient.sendVerificationEmail({
        email: email.trim(),
        callbackURL: "/dashboard",
      });
      if (error) {
        toast.error(error.message ?? "Nie udało się wysłać e-maila. Spróbuj ponownie.");
        return;
      }
      toast.success("Wysłaliśmy link ponownie. Sprawdź też folder ze spamem.");
      setCooldown(COOLDOWN_SECONDS);
    });
  }

  return (
    <div className="grid gap-3">
      {!initialEmail && (
        <Input
          type="email"
          placeholder="Twój adres e-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full"
        onClick={resend}
        disabled={pending || cooldown > 0 || !email.trim()}
      >
        {pending
          ? "Wysyłanie…"
          : cooldown > 0
            ? `Wyślij ponownie (${cooldown} s)`
            : "Nie dotarł? Wyślij ponownie"}
      </Button>
    </div>
  );
}
