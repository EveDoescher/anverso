"use client";

import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  current?: boolean;
  onClick?: () => void;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Localização"
      className={[
        "flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-paper-soft)] px-3 py-2",
        "max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden",
        className,
      ].join(" ")}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Home size={13} className="shrink-0 text-[var(--color-green)]" />

      {items.map((item, index) => (
        <span key={item.label} className="flex shrink-0 items-center gap-1.5">
          {index > 0 ? (
            <ChevronRight size={12} className="text-[var(--color-neutral)]" />
          ) : null}

          <button
            type="button"
            disabled={item.current}
            onClick={item.onClick}
            className={[
              "anverso-focus rounded-full px-1.5 py-0.5 text-[11px] font-bold transition-all",
              item.current
                ? "cursor-default text-[var(--color-green)]"
                : "text-[var(--color-neutral)] hover:bg-[rgba(63,91,74,0.08)] hover:text-[var(--color-green)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}