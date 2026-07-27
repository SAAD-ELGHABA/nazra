import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARDHOME } from "@/constant/routerConstants";

export function AdminForbiddenState({
  title = "You don't have permission to access this page.",
  description = "Contact a super administrator if you believe this is an error.",
  className,
}) {
  return (
    <section
      className={`grid min-h-[50vh] place-items-center p-6 text-center ${className ?? ""}`}
      aria-labelledby="forbidden-title"
    >
      <div className="max-w-md">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h1 id="forbidden-title" className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-6">
          <Link to={DASHBOARDHOME}>Back to Overview</Link>
        </Button>
      </div>
    </section>
  );
}

export default AdminForbiddenState;
