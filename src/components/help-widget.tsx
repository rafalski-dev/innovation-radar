"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { BugIcon, DatabaseIcon, LifeBuoyIcon, LightbulbIcon } from "lucide-react";
import { toast } from "sonner";
import { submitFeedback } from "@/actions/feedback";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { cn } from "@/lib/utils";
import { FEEDBACK_LABELS, FEEDBACK_MESSAGE_MAX, type FeedbackKind } from "@/validation/feedback";

const OPTIONS: { type: FeedbackKind; icon: typeof BugIcon; hint: string }[] = [
  { type: "RADAR_PROBLEM", icon: BugIcon, hint: "Coś nie działa lub działa inaczej, niż trzeba" },
  { type: "SOURCE_PROBLEM", icon: DatabaseIcon, hint: "Błędne lub brakujące wyniki ze źródła" },
  { type: "CHANGE_PROPOSAL", icon: LightbulbIcon, hint: "Pomysł na nową funkcję lub poprawkę" },
];

// Pływający przycisk „Pomoc” na każdej stronie: trzy rodzaje zgłoszeń zapisywane w bazie (podgląd w panelu admina).
export function HelpWidget({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackKind>("RADAR_PROBLEM");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await submitFeedback({
        type,
        subject,
        message,
        email,
        pageUrl: `${pathname}${window.location.search}`.slice(0, 500),
      });
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Dziękujemy, zgłoszenie zostało wysłane");
      setMessage("");
      setSubject("");
      setErrors({});
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className="fixed right-4 bottom-4 z-40 h-10 gap-2 rounded-full bg-brand px-4 text-white shadow-lg shadow-brand/25 hover:bg-brand/90 dark:bg-brand dark:text-white print:hidden"
            aria-label="Pomoc"
          />
        }
      >
        <LifeBuoyIcon />
        Pomoc
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pomoc</DialogTitle>
          <DialogDescription>Wybierz rodzaj zgłoszenia i opisz sprawę.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Rodzaj zgłoszenia">
          {OPTIONS.map(({ type: value, icon: Icon, hint }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-sm transition-colors hover:bg-muted",
                type === value && "border-foreground/60 bg-muted/70",
              )}
            >
              <Icon className="size-4 text-brand" />
              <span className="font-medium">{FEEDBACK_LABELS[value]}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3">
          {type === "SOURCE_PROBLEM" && (
            <FormField
              label="Którego źródła dotyczy?"
              htmlFor="help-subject"
              error={errors.subject?.[0]}
            >
              <Input
                id="help-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="np. NCBiR, RAD-on"
                maxLength={150}
              />
            </FormField>
          )}
          <FormField label="Opis" htmlFor="help-message" error={errors.message?.[0]}>
            <Textarea
              id="help-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={FEEDBACK_MESSAGE_MAX}
            />
          </FormField>
          {!isLoggedIn && (
            <FormField
              label="Twój e-mail (opcjonalnie, jeśli chcesz odpowiedź)"
              htmlFor="help-email"
              error={errors.email?.[0]}
            >
              <Input
                id="help-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Anuluj</DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Wysyłanie…" : "Wyślij zgłoszenie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
