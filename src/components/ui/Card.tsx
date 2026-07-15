import type { ReactNode } from "react";

type CardVariant = "paper" | "cream" | "outlined" | "interactive";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
};

const variantClasses: Record<CardVariant, string> = {
  paper:
    "border-[var(--color-border)] bg-[var(--color-paper-soft)]",
  cream:
    "border-[var(--color-border)] bg-[var(--color-cream-soft)]",
  outlined:
    "border-[var(--color-border)] bg-transparent",
  interactive:
    "border-[var(--color-border)] bg-[var(--color-paper-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-green)] hover:bg-[var(--color-paper)] hover:shadow-[var(--shadow-soft)]",
};

export function Card({
  children,
  variant = "paper",
  className = "",
  style,
}: CardProps) {
  return (
    <article
      style={style}
      className={[
        "rounded-[14px] border p-4",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </article>
  );
}