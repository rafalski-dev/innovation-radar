"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, XIcon } from "lucide-react";
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
  const [newFiles, setNewFiles] = useState<File[]>([]); // wybrane, jeszcze niewysłane
  const [removedIds, setRemovedIds] = useState<string[]>([]); // zapisane pliki do usunięcia
  // edycja i dodawanie z listy potrzeb wracają na /dashboard/projects; dodawanie ze strony organizacji na nią
  const backHref =
    need || businesses ? "/dashboard/projects" : `/dashboard/businesses/${businessId}`;
  const form = useForm<NeedInput>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      title: need?.title ?? "",
      description: need?.description ?? "",
      linkUrl: need?.linkUrl ?? "",
    },
  });
  const { errors } = form.formState;

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
      router.push(backHref);
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

      <FormField
        label="Opis projektu *"
        htmlFor="n-description"
        error={errors.description?.message}
      >
        <Textarea
          id="n-description"
          rows={8}
          placeholder="Co chcesz osiągnąć i jakiego rozwiązania szukasz? Dodaj ograniczenia (budżet, technologia, termin)."
          aria-invalid={!!errors.description}
          {...form.register("description")}
        />
      </FormField>

      <div className="grid gap-4 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Materiały dodatkowe: możesz dołączyć link i/lub pliki PDF.
        </p>

        <FormField label="Link (opcjonalnie)" htmlFor="n-link" error={errors.linkUrl?.message}>
          <Input
            id="n-link"
            type="url"
            inputMode="url"
            placeholder="https://"
            aria-invalid={!!errors.linkUrl}
            {...form.register("linkUrl")}
          />
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
