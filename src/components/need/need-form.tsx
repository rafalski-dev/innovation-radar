"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, PlusIcon, SparklesIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { createNeed, createNeedFileUpload, updateNeed } from "@/actions/need";
import { FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { cn } from "@/lib/utils";
import type { NeedRow } from "@/queries/need";
import {
  NEED_FILE_MAX_BYTES,
  NEED_FILE_MAX_MB,
  NEED_FILES_MAX,
  NEED_LINKS_MAX,
  type DescriptionSuggestion,
  type NeedAttachmentInput,
  type NeedInput,
  needSchema,
} from "@/validation/need";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type BusinessOption = { id: string; name: string; city: string | null; nip: string | null };

// brak need = dodawanie, jest = edycja
// `businesses` (zamiast `businessId`) = dodawanie z listy potrzeb: organizację wybiera się w formularzu
export function NeedForm({
  businessId,
  businesses,
  need,
}: {
  businessId?: string;
  businesses?: BusinessOption[];
  need?: NeedRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(
    businessId ?? (businesses?.length === 1 ? businesses[0].id : ""),
  );
  const [orgError, setOrgError] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [expanding, setExpanding] = useState(false);
  const [suggestions, setSuggestions] = useState<DescriptionSuggestion[]>([]);
  const [added, setAdded] = useState<number[]>([]); // indeksy już dodanych propozycji
  const [newFiles, setNewFiles] = useState<File[]>([]); // wybrane, jeszcze niewysłane
  const [removedIds, setRemovedIds] = useState<string[]>([]); // zapisane pliki do usunięcia
  // po zapisie zawsze lista projektów; „Anuluj” wraca tam, skąd użytkownik przyszedł
  const backHref =
    need || businesses ? "/dashboard/projects" : `/dashboard/businesses/${businessId}`;
  const form = useForm<NeedInput>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      title: need?.title ?? "",
      description: need?.description ?? "",
      linkUrls: need?.linkUrls.length ? need.linkUrls : [""],
    },
  });
  const { errors } = form.formState;
  const links = useWatch({ control: form.control, name: "linkUrls" });

  const savedFiles = (need?.files ?? []).filter((f) => !removedIds.includes(f.id));
  const filesCount = savedFiles.length + newFiles.length;

  // Input zawsze widoczny: każdy wybór dopisuje pliki do listy pod nim (do NEED_FILES_MAX).
  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // pozwala wybrać ten sam plik ponownie
    let count = filesCount;
    const accepted: File[] = [];
    let error: string | undefined;
    for (const file of picked) {
      if (file.type !== "application/pdf") error = `„${file.name}”: dozwolone są tylko pliki PDF`;
      else if (file.size > NEED_FILE_MAX_BYTES)
        error = `„${file.name}” jest za duży (maksymalnie ${NEED_FILE_MAX_MB} MB)`;
      else if (count >= NEED_FILES_MAX) error = `Maksymalnie ${NEED_FILES_MAX} pliki PDF`;
      else if (newFiles.some((f) => f.name === file.name && f.size === file.size)) continue;
      else {
        accepted.push(file);
        count++;
      }
    }
    setNewFiles((prev) => [...prev, ...accepted]);
    setFileError(error);
  }

  // AI proponuje uzupełnienia opisu na podstawie tytułu i tego, co już wpisano. Niczego nie zapisujemy.
  async function generateSuggestions() {
    const { title, description } = form.getValues();
    setExpanding(true);
    try {
      const response = await fetch("/api/needs/expand-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const result = (await response.json().catch(() => null)) as
        { success: true; data: DescriptionSuggestion[] } | { success: false; error: string } | null;
      if (!result?.success) {
        toast.error(result?.error ?? "Nie udało się wygenerować propozycji");
        return;
      }
      setSuggestions(result.data);
      setAdded([]);
    } catch (error) {
      console.error(error);
      toast.error("Nie udało się wygenerować propozycji");
    } finally {
      setExpanding(false);
    }
  }

  // Dopisuje tekst propozycji na końcu opisu (nie nadpisuje tego, co już jest).
  function addSuggestion(index: number) {
    const current = form.getValues("description").trim();
    const text = suggestions[index].text;
    form.setValue("description", current ? `${current}\n\n${text}` : text, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAdded((prev) => [...prev, index]);
  }

  // Organizacja jest poza RHF, więc jej błąd ustawiamy tu, od razu razem z błędami pozostałych pól.
  function onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!need && !selectedId) setOrgError("Wybierz organizację");
    return form.handleSubmit(onSubmit)(event);
  }

  function onSubmit(values: NeedInput) {
    if (!need && !selectedId) return;
    startTransition(async () => {
      // opcjonalne PDF-y najpierw jadą prosto do R2 (podpisane adresy), potem zapisujemy potrzebę
      const attachments: NeedAttachmentInput[] = [];
      for (const file of newFiles) {
        const upload = await createNeedFileUpload({
          fileName: file.name,
          size: file.size,
          type: file.type,
        });
        if (!upload.success) {
          setFileError(upload.error);
          return;
        }
        try {
          const response = await fetch(upload.data.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/pdf" },
            body: file,
          });
          if (!response.ok) throw new Error(`R2: ${response.status}`);
        } catch (error) {
          console.error(error);
          setFileError(`Nie udało się wysłać pliku „${file.name}”, spróbuj ponownie`);
          return;
        }
        attachments.push({ key: upload.data.key, fileName: file.name });
      }

      const result = need
        ? await updateNeed(need.id, values, { attachments, removeFileIds: removedIds })
        : await createNeed(selectedId, values, attachments);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(need ? "Zapisano zmiany" : "Dodano projekt");
      router.push("/dashboard/projects");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onFormSubmit} className="grid max-w-2xl gap-4">
      {businesses && (
        <FormField label="Organizacja *" error={orgError}>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Organizacja</legend>
            {businesses.map((b) => (
              <label
                key={b.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  b.id === selectedId && "border-primary bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="businessId"
                  value={b.id}
                  checked={b.id === selectedId}
                  onChange={() => {
                    setSelectedId(b.id);
                    setOrgError(undefined);
                  }}
                  className="mt-1 accent-current"
                />
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate text-sm font-medium">{b.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {[b.city, b.nip && `NIP ${b.nip}`].filter(Boolean).join(" · ") || "—"}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </FormField>
      )}

      <FormField label="Tytuł projektu *" htmlFor="n-title" error={errors.title?.message}>
        <Input
          id="n-title"
          placeholder="np. Automatyczna kontrola jakości na linii"
          aria-invalid={!!errors.title}
          {...form.register("title")}
        />
      </FormField>

      <FormField label="Opis *" htmlFor="n-description" error={errors.description?.message}>
        <Textarea
          id="n-description"
          rows={8}
          placeholder="Co chcesz osiągnąć i jakiego rozwiązania szukasz? Na podstawie opisu wyszukujemy pasujące innowacje."
          aria-invalid={!!errors.description}
          {...form.register("description")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={expanding || pending}
          >
            <SparklesIcon />
            {expanding
              ? "Generowanie…"
              : suggestions.length
                ? "Wygeneruj ponownie"
                : "Zaproponuj uzupełnienia z AI"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Wpisz kilka zdań, a AI zaproponuje, co jeszcze warto dodać. Kliknij propozycję, aby
            dopisać ją do opisu.
          </span>
        </div>
        {suggestions.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((suggestion, i) => {
              const isAdded = added.includes(i);
              return (
                <li key={`${suggestion.label}-${i}`} className="grid">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isAdded}
                    onClick={() => addSuggestion(i)}
                    className="h-auto items-start justify-start gap-2 px-3 py-2 text-left whitespace-normal"
                  >
                    <PlusIcon className="mt-0.5" />
                    <span className="grid gap-0.5">
                      <span className="font-medium">
                        {suggestion.label}
                        {isAdded && " (dodano)"}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {suggestion.text}
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </FormField>

      <div className="grid gap-4 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Materiały dodatkowe: możesz dołączyć linki i/lub pliki PDF.
        </p>

        <FormField label={`Linki (opcjonalnie, do ${NEED_LINKS_MAX})`} htmlFor="n-link-0">
          <div className="grid gap-2">
            {links.map((url, i) => (
              <div key={i} className="grid gap-1">
                <div className="flex gap-2">
                  <Input
                    id={`n-link-${i}`}
                    type="url"
                    inputMode="url"
                    placeholder="https://"
                    value={url}
                    aria-invalid={!!errors.linkUrls?.[i]}
                    onChange={(event) =>
                      form.setValue(
                        "linkUrls",
                        links.map((l, j) => (j === i ? event.target.value : l)),
                        { shouldDirty: true, shouldValidate: form.formState.isSubmitted },
                      )
                    }
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        form.setValue(
                          "linkUrls",
                          links.filter((_, j) => j !== i),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <XIcon />
                      <span className="sr-only">Usuń link {i + 1}</span>
                    </Button>
                  )}
                </div>
                {errors.linkUrls?.[i]?.message && (
                  <p className="text-sm text-destructive">{errors.linkUrls[i]?.message}</p>
                )}
              </div>
            ))}
            {links.length < NEED_LINKS_MAX && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() => form.setValue("linkUrls", [...links, ""], { shouldDirty: true })}
              >
                <PlusIcon />
                Dodaj kolejny link
              </Button>
            )}
          </div>
        </FormField>

        <FormField label="Pliki PDF (opcjonalnie)" htmlFor="n-file" error={fileError}>
          <Input
            id="n-file"
            type="file"
            multiple
            accept="application/pdf,.pdf"
            disabled={filesCount >= NEED_FILES_MAX}
            aria-invalid={!!fileError}
            onChange={onPickFiles}
          />
          <p className="text-xs text-muted-foreground">
            Dodano {filesCount} z {NEED_FILES_MAX} (każdy do {NEED_FILE_MAX_MB} MB).
          </p>
          {filesCount > 0 && (
            <ul className="divide-y rounded-md border text-sm">
              {savedFiles.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <a
                    href={`/api/project-files/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-2 hover:underline"
                  >
                    <FileTextIcon className="size-4 shrink-0" />
                    <span className="truncate">{file.fileName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </span>
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setRemovedIds((ids) => [...ids, file.id])}
                  >
                    <XIcon />
                    <span className="sr-only">Usuń plik {file.fileName}</span>
                  </Button>
                </li>
              ))}
              {newFiles.map((file) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileTextIcon className="size-4 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatSize(file.size)} · do wysłania
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setNewFiles((prev) => prev.filter((f) => f !== file))}
                  >
                    <XIcon />
                    <span className="sr-only">Usuń plik {file.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </FormField>
      </div>

      <div className="flex justify-end gap-2">
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          Anuluj
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Zapisywanie…" : need ? "Zapisz" : "Dodaj projekt"}
        </Button>
      </div>
    </form>
  );
}
