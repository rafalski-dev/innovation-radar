"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "@/actions/admin";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";

type Values = { phrasesPromptExtra: string; agentPromptExtra: string; agentRunLimit: string };

// Zakres promptów: dodatkowe wytyczne dopisywane do promptów AI oraz limit uruchomień agenta.
export function AdminSettings({ initial }: { initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveSettings(values);
      if (!result.success) {
        const first = Object.values(result.fieldErrors ?? {}).flat()[0];
        toast.error(first ?? result.error);
        return;
      }
      toast.success("Zapisano ustawienia");
    });
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <FormField label="Dodatkowe wytyczne do fraz i opisów" htmlFor="adm-phrases">
        <Textarea
          id="adm-phrases"
          rows={4}
          maxLength={1500}
          placeholder="np. Uwzględniaj też synonimy angielskie i skróty branżowe."
          value={values.phrasesPromptExtra}
          onChange={(e) => setValues({ ...values, phrasesPromptExtra: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Dopisywane do promptów generowania fraz i uzupełnień opisu projektu.
        </p>
      </FormField>
      <FormField label="Dodatkowe wytyczne dla agenta wyszukującego" htmlFor="adm-agent">
        <Textarea
          id="adm-agent"
          rows={4}
          maxLength={1500}
          placeholder="np. Preferuj projekty zakończone w ostatnich 5 latach."
          value={values.agentPromptExtra}
          onChange={(e) => setValues({ ...values, agentPromptExtra: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Dopisywane do promptu agenta przeszukującego źródła.
        </p>
      </FormField>
      <FormField label="Limit uruchomień agenta (na użytkownika, na 30 minut)" htmlFor="adm-limit">
        <Input
          id="adm-limit"
          type="number"
          min={1}
          max={100}
          value={values.agentRunLimit}
          onChange={(e) => setValues({ ...values, agentRunLimit: e.target.value })}
          className="max-w-32"
        />
      </FormField>
      <Button onClick={save} disabled={pending} className="justify-self-start">
        {pending ? "Zapisywanie…" : "Zapisz ustawienia"}
      </Button>
    </div>
  );
}
