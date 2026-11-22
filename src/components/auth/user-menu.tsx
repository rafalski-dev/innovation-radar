"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { authClient } from "@/lib/auth-client";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">{name}</span>
      <Button variant="outline" size="sm" onClick={logout} disabled={pending}>
        <LogOutIcon />
        Wyloguj
      </Button>
    </div>
  );
}
