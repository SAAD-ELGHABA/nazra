import React from "react";
import { SITE_CONFIG } from "../config/site";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  variant = "primary",
  className,
  imageClassName,
  compact = false,
}) {
  const src = compact
    ? SITE_CONFIG.brand.icon
    : variant === "light"
      ? SITE_CONFIG.brand.logoLight
      : SITE_CONFIG.brand.logo;

  return (
    <span className={cn("inline-flex w-full items-center", className)}>
      <img
        src={src}
        alt={SITE_CONFIG.name}
        width={compact ? 116 : 348}
        height={compact ? 153 : 108}
        className={cn("block h-auto w-full object-contain", imageClassName)}
      />
    </span>
  );
}
