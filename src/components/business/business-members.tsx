"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { addBusinessMember, removeBusinessMember } from "@/actions/business";
import { FormField } from "@/components/form-field";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import type { BusinessWithNeeds } from "@/queries/business";
import { type AddMemberInput, addMemberSchema } from "@/validation/business";

// Osoby organizacji: administrator (właściciel) + przypisani członkowie.
// Dodawać i usuwać może tylko administrator.
export function BusinessMembers({ business }: { business: BusinessWithNeeds }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
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

      <ul className="divide-y rounded-lg border">
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
        <form onSubmit={form.handleSubmit(onAdd)} className="flex items-start gap-2">
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
        </form>
      )}
    </div>
  );
}
