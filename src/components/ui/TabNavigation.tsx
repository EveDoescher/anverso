"use client";

import type { LucideIcon } from "lucide-react";

export type TabNavigationItem = {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
};

type TabNavigationProps = {
  items: TabNavigationItem[];
  activeId: string;
  onChange?: (id: string) => void;
  className?: string;
};

export function TabNavigation({
  items,
  activeId,
  onChange,
  className = "",
}: TabNavigationProps) {
  return (
    <div className={["relative w-full", className].join(" ")}>
      {/* Container de rolagem */}
      <div
        className="flex w-full overflow-x-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-1 sm:overflow-x-visible md:rounded-full [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex w-max gap-1">
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange?.(item.id)}
                className={[
                  "anverso-focus group flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-[var(--color-green)] text-white shadow-[var(--shadow-button)]"
                    : "text-[var(--color-neutral)] hover:bg-[rgba(47,44,45,0.06)] hover:text-[var(--color-text)]",
                ].join(" ")}
              >
                {item.icon && (
                  <item.icon
                    size={18}
                    strokeWidth={2.5}
                    className={
                      isActive
                        ? "text-[rgba(255,255,255,0.9)]"
                        : "text-[var(--color-neutral)] opacity-70 transition-colors group-hover:text-[var(--color-text)] group-hover:opacity-100"
                    }
                  />
                )}
                {item.label}

                {item.count ? (
                  <span
                    className={[
                      "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px]",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[rgba(47,44,45,0.08)] text-[var(--color-neutral)]",
                    ].join(" ")}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}