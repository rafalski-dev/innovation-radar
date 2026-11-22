"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckIcon, LinkIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  // adres do udostępnienia; domyślnie bieżąca strona
  url?: string;
  className?: string;
};

const brand = (d: string) => (
  <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
    <path d={d} />
  </svg>
);

const ICONS = {
  linkedin: brand(
    "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  ),
  facebook: brand(
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z",
  ),
  x: brand(
    "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41Z",
  ),
};

// Moduł „Udostępnij”: LinkedIn, Facebook, X, kopiowanie linku i (na urządzeniach z obsługą) systemowe udostępnianie.
export function ShareButtons({ title, url, className }: Props) {
  const [copied, setCopied] = useState(false);
  const canShare = useSyncExternalStore(
    () => () => {},
    () => "share" in navigator,
    () => false,
  );
  const target = () => url ?? window.location.href;

  function open(build: (u: string, t: string) => string) {
    window.open(
      build(encodeURIComponent(target()), encodeURIComponent(title)),
      "_blank",
      "noopener,noreferrer,width=640,height=560",
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(target());
      setCopied(true);
      toast.success("Skopiowano link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nie udało się skopiować linku");
    }
  }

  const items = [
    {
      label: "LinkedIn",
      icon: ICONS.linkedin,
      onClick: () => open((u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`),
    },
    {
      label: "Facebook",
      icon: ICONS.facebook,
      onClick: () => open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`),
    },
    {
      label: "X",
      icon: ICONS.x,
      onClick: () => open((u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`),
    },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2" })}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={copy}
        className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2" })}
      >
        {copied ? <CheckIcon className="size-4" /> : <LinkIcon className="size-4" />}
        Kopiuj link
      </button>
      {canShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url: target() }).catch(() => {})}
          className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2" })}
        >
          <Share2Icon className="size-4" />
          Więcej
        </button>
      )}
    </div>
  );
}
