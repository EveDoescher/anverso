import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "info" | "error" | "gold";

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "border-[var(--color-border)] bg-[var(--color-paper-soft)] text-[var(--color-neutral)]",
  success:
    "border-[var(--color-success-soft)] bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning:
    "border-[var(--color-warning-soft)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  info:
    "border-[var(--color-info-soft)] bg-[var(--color-info-bg)] text-[var(--color-info)]",
  error:
    "border-[var(--color-error-soft)] bg-[var(--color-error-bg-soft)] text-[var(--color-error)]",
  gold:
    "border-[rgba(145,88,24,0.28)] bg-[var(--color-warning-bg)] text-[var(--color-gold)]",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex shrink-0 whitespace-nowrap h-6 items-center rounded-full border px-2.5 text-[11px] md:text-[10px] font-bold",
        toneClasses[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}