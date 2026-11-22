"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { addBusinessMember, removeBusinessMember } from "@/actions/business";
import { FormField } from "@/components/form-field";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { BusinessWithNeeds } from "@/queries/business";
import { type AddMemberInput, addMemberSchema } from "@/validation/business";

// Osoby organizacji: administrator (właściciel) + przypisani członkowie.
// Dodawać i usuwać może tylko administrator.
export function BusinessMembers({ business }: { business: BusinessWithNeeds }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "", consent: false },
  });
  const { errors } = form.formState;

  function onAdd(values: AddMemberInput) {
    startTransition(async () => {
      const result = await addBusinessMember(business.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Dodano osobę do organizacji");
      form.reset();
    });
  }

  function onRemove(userId: string) {
    startTransition(async () => {
      const result = await removeBusinessMember(business.id, userId);
      if (result.success) toast.success("Usunięto osobę z organizacji");
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Osoby</h3>

      <ul className="divide-y rounded-2xl border bg-card">
        <li className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
          <div className="min-w-0">
            <div className="truncate font-medium">{business.owner.name}</div>
            <div className="truncate text-xs text-muted-foreground">{business.owner.email}</div>
          </div>
          <Badge variant="secondary">Administrator</Badge>
        </li>
        {business.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="truncate font-medium">{m.user.name}</div>
              <div className="truncate text-xs text-muted-foreground">{m.user.email}</div>
            </div>
            {business.isAdmin ? (
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => onRemove(m.userId)}
              >
                <XIcon />
                <span className="sr-only">Usuń z organizacji</span>
              </Button>
            ) : (
              <Badge variant="outline">Członek</Badge>
            )}
          </li>
        ))}
      </ul>

      {business.isAdmin && (
        <form onSubmit={form.handleSubmit(onAdd)} className="grid gap-3">
          <div className="flex items-start gap-2">
            <FormField
              label="Dodaj osobę (e-mail zarejestrowanego konta)"
              htmlFor={`member-email-${business.id}`}
              error={errors.email?.message}
              className="flex-1"
            >
              <Input
                id={`member-email-${business.id}`}
                type="email"
                placeholder="np. anna.nowak@example.com"
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
            </FormField>
            <Button type="submit" disabled={pending} className="mt-[1.625rem]">
              Dodaj
            </Button>
          </div>
          <div className="grid gap-1.5">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50",
                errors.consent && "border-destructive bg-destructive/5 hover:bg-destructive/10",
              )}
            >
              <input
                type="checkbox"
                className="peer sr-only"
                aria-invalid={!!errors.consent}
                {...form.register("consent")}
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-input bg-background text-transparent transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                  "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                  errors.consent && "border-destructive",
                )}
              >
                <CheckIcon className="size-3" strokeWidth={3} />
              </span>
              <span className="text-sm leading-snug text-muted-foreground">
                Oświadczam, że jestem uprawniony/a do udostępnienia danych osobowych zapraszanej
                osoby w celu wysłania zaproszenia do profilu firmowego w {site.name}, a osoba ta
                została poinformowana o zasadach przetwarzania jej danych zgodnie z Polityką
                Prywatności.
              </span>
            </label>
            {errors.consent?.message && (
              <p className="text-sm text-destructive">{errors.consent.message}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
