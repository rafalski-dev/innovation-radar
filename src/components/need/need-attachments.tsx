import { ExternalLinkIcon, FileTextIcon } from "lucide-react";

type Props = {
  need: {
    linkUrls: string[];
    files: { id: string; fileName: string }[];
  };
};

// Opcjonalne materiały przy potrzebie: linki i/lub pliki PDF.
export function NeedAttachments({ need }: Props) {
  if (need.linkUrls.length === 0 && need.files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {need.linkUrls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 items-center gap-1 hover:underline"
        >
          <ExternalLinkIcon className="size-3 shrink-0" />
          <span className="max-w-64 truncate">{url.replace(/^https?:\/\//, "")}</span>
        </a>
      ))}
      {need.files.map((file) => (
        <a
          key={file.id}
          href={`/api/project-files/${file.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center gap-1 hover:underline"
        >
          <FileTextIcon className="size-3 shrink-0" />
          <span className="max-w-64 truncate">{file.fileName}</span>
        </a>
      ))}
    </div>
  );
}
