import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormSection({ children, className }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 shadow-sm sm:p-6", className)}>
      {children}
    </section>
  );
}

export function FormSectionHeader({ title, description, className }) {
  return (
    <div className={cn("mb-5", className)}>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function FormGrid({ children, className }) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function FormActions({ children, className }) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end", className)}>
      {children}
    </div>
  );
}

export function FieldError({ children, id, className }) {
  if (!children) return null;
  return <p id={id} className={cn("mt-1 text-sm text-destructive", className)}>{children}</p>;
}

export const FormErrorSummary = React.forwardRef(function FormErrorSummary(
  { title = "Please review the form", children, className, ...props },
  ref,
) {
  if (!children) return null;
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={cn(
        "rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm focus-visible:ring-2 focus-visible:ring-destructive",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <div className="mt-1 text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
});
