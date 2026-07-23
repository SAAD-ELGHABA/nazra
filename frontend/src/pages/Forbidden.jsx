import React from "react";
import { ShieldAlert } from "lucide-react";

const Forbidden = () => (
  <main className="grid min-h-[60vh] place-items-center p-6 text-center">
    <div className="max-w-md">
      <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
      <h1 className="mt-4 text-2xl font-semibold">Access forbidden</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You do not have permission to view this admin area.
      </p>
    </div>
  </main>
);

export default Forbidden;
