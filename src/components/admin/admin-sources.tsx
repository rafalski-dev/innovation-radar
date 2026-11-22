"use client";

import { useState, useTransition } from "react";
import { PencilIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { createSource, deleteSource, updateSource } from "@/actions/admin";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";

type Source = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  description: string;
  active: boolean;
};

type Draft = { name: string; domain: string; description: string; active: boolean };
const EMPTY: Draft = { name: "", domain: "", description: "", active: true };

// Źródła agenta: dodawanie, edycja (nazwa, domena, opis), włączanie/wyłączanie i usuwanie.
export function AdminSources({ sources }: { sources: Source[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  function startEdit(source: Source | "new") {
    setEditingId(source === "new" ? "new" : source.id);
    setDraft(
      source === "new"
        ? EMPTY
        : {
            name: source.name,
            domain: source.domain,
            description: source.description,
            active: source.active,
          },
    );
  }

  function save() {
    startTransition(async () => {
      const result =
        editingId === "new" ? await createSource(draft) : await updateSource(editingId!, draft);
      if (!result.success) {
        const first = Object.values(result.fieldErrors ?? {}).flat()[0];
        toast.error(first ?? result.error);
        return;
      }
      toast.success(editingId === "new" ? "Dodano źródło" : "Zapisano źródło");
      setEditingId(null);
    });
  }

  function toggleActive(source: Source) {
    startTransition(async () => {
      const result = await updateSource(source.id, { ...source, active: !source.active });
      if (!result.success) toast.error(result.error);
    });
  }

  const form = (
    <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
      <Input
        placeholder="Nazwa, np. Mapa Dotacji UE"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />
      <Input
        placeholder="Domena, np. mapadotacji.gov.pl"
        value={draft.domain}
        onChange={(e) => setDraft({ ...draft, domain: e.target.value })}
      />
      <Input
        placeholder="Krótki opis (co daje źródło)"
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        className="sm:col-span-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          className="accent-current"
        />
        Aktywne (widoczne dla użytkowników)
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
          Anuluj
        </Button>
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? "Zapisywanie…" : "Zapisz"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <ul className="grid gap-2">
        {sources.map((source) =>
          editingId === source.id ? (
            <li key={source.id}>{form}</li>
          ) : (
            <li
              key={source.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{source.name}</span>
                  <Badge variant={source.active ? "secondary" : "outline"}>
                    {source.active ? "Aktywne" : "Wyłączone"}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{source.domain}</p>
                {source.description && (
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => toggleActive(source)}
                >
                  {source.active ? "Wyłącz" : "Włącz"}
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => startEdit(source)}>
                  <PencilIcon />
                  <span className="sr-only">Edytuj źródło</span>
                </Button>
                <ConfirmDeleteButton
                  itemName={source.name}
                  icon={<XIcon />}
                  onConfirm={() => deleteSource(source.id)}
                />
              </div>
            </li>
          ),
        )}
      </ul>
      {editingId === "new" ? (
        form
      ) : (
        <Button variant="outline" size="sm" onClick={() => startEdit("new")}>
          <PlusIcon />
          Dodaj źródło
        </Button>
      )}
    </div>
  );
}
