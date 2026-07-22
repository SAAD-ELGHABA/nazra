import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { HOME } from "@/constant/routerConstants";

export default function AuthShell({ title, description, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ef] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#906941]/10 to-transparent"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <Link
          to={HOME}
          className="mx-auto mb-6 block w-fit font-display text-xl font-semibold tracking-[0.24em] text-black"
          aria-label="NAZRA home"
        >
          NAZRA
        </Link>

        <Card className="gap-0 rounded-2xl border-black/10 bg-white py-0 shadow-xl shadow-black/5">
          <CardHeader className="gap-2 px-6 pb-5 pt-7 text-center sm:px-8 sm:pt-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              {title}
            </h1>
            <CardDescription className="mx-auto max-w-sm leading-6">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
            {children}
            {footer ? (
              <div className="mt-6 border-t border-black/10 pt-5 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
