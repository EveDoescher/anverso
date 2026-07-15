import { Info, AlertCircle } from "lucide-react";
import React from "react";

export type FieldHelperProps = {
  children: React.ReactNode;
  variant?: "neutral" | "error" | "info";
  className?: string;
};

export function FieldHelper({ children, variant = "neutral", className = "" }: FieldHelperProps) {
  if (!children) return null;

  const isError = variant === "error";
  const isInfo = variant === "info";

  return (
    <div className={`mt-2 flex items-start gap-1.5 text-[13px] ${isError ? "text-[var(--color-error)] font-medium" : "text-[var(--color-neutral)]"} ${className}`}>
      {isInfo && <Info size={14} className="mt-[2.5px] shrink-0" />}
      {isError && <AlertCircle size={14} className="mt-[2.5px] shrink-0" />}
      <span className="flex-1 leading-snug">{children}</span>
    </div>
  );
}
