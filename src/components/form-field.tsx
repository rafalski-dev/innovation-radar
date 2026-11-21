import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
