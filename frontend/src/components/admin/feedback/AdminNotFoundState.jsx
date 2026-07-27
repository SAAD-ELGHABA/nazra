import React from "react";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AdminNotFoundState({
  title = "Page not found",
  description = "The resource you requested does not exist or may have been removed.",
  backHref,
  backLabel = "Go back",
  className,
}) {
  return (
    <div className={`flex min-h-48 flex-col items-center justify-center text-center ${className ?? ""}`}>
      <FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {backHref && (
        <Button asChild variant="outline" className="mt-5">
          <Link to={backHref}>{backLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export default AdminNotFoundState;
