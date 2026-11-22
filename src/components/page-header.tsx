import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  // słowo wyróżnione kursywą szeryfową w kolorze akcentu (jak w nagłówkach strony głównej)
  accent?: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, accent, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">
          {title}
          {title && accent && " "}
          {accent && <span className="text-brand">{accent}</span>}
        </h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
