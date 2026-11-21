"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { addTeamMember, deleteTeam, removeTeamMember } from "@/actions/team";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { FormField } from "@/components/form-field";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import type { TeamDetail } from "@/queries/team";
import { type AddMemberInput, addMemberSchema } from "@/validation/team";

export function TeamMembers({ team }: { team: TeamDetail }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
  });

  function onAdd(values: AddMemberInput) {
    startTransition(async () => {
      const result = await addTeamMember(team.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Dodano członka");
      form.reset();
    });
  }

  function onRemove(userId: string) {
    startTransition(async () => {
      const result = await removeTeamMember(team.id, userId);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-lg border">
        {team.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{m.user.name}</div>
              <div className="text-xs text-muted-foreground">{m.user.email}</div>
            </div>
            <div className="flex items-center gap-2">
              {m.userId === team.ownerId && <Badge variant="secondary">Właściciel</Badge>}
              {team.isOwner && m.userId !== team.ownerId && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => onRemove(m.userId)}
                >
                  <XIcon />
                  <span className="sr-only">Usuń z zespołu</span>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {team.isOwner && (
        <form onSubmit={form.handleSubmit(onAdd)} className="flex items-start gap-2">
          <FormField
            label="Dodaj członka (e-mail zarejestrowanego użytkownika)"
            htmlFor="member-email"
            error={form.formState.errors.email?.message}
            className="flex-1"
          >
            <Input id="member-email" type="email" {...form.register("email")} />
          </FormField>
          <Button type="submit" disabled={pending} className="mt-[1.625rem]">
            Dodaj
          </Button>
        </form>
      )}
    </div>
  );
}

export function DeleteTeamButton({ team }: { team: TeamDetail }) {
  const router = useRouter();
  if (!team.isOwner) return null;
  return (
    <ConfirmDeleteButton
      itemName={team.name}
      onConfirm={async () => {
        const result = await deleteTeam(team.id);
        if (result.success) router.push("/dashboard/teams");
        return result;
      }}
    />
  );
}
