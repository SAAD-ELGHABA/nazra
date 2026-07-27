import React from "react";
import { cn } from "@/lib/utils";

export function AdminPageContainer({ children, className }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] flex-1 space-y-6 px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AdminPageContainer;
