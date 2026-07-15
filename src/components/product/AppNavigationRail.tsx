"use client";

import Image from "next/image";
import {
  Archive,
  BookOpen,
  FileText,
  Home,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";

export type AppNavigationItem = {
  id: string;
  label: string;
  description: string;
  count?: number;
};

type AppNavigationRailProps = {
  items: AppNavigationItem[];
  activeId: string;
  onChange?: (id: string) => void;
  className?: string;
};

const iconMap = {
  inicio: Home,
  trabalhos: FileText,
  modelos: Sparkles,
  biblioteca: Library,
  referencias: BookOpen,
  arquivos: Archive,
  configuracoes: Settings,
};

export function AppNavigationRail({
  items,
  activeId,
  onChange,
  className = "",
}: AppNavigationRailProps) {
  return (
    <aside
      className={[
        "flex w-full md:w-[238px] flex-col rounded-[18px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4 transition-all",
        className,
      ].join(" ")}
    >
      <div className="mb-4 px-1 flex justify-center">
        {/* Container invisível para "castrar" o espaço transparente da imagem quadrada */}
        <div className="relative h-[66px] w-[140px] overflow-hidden">
          <Image
            src="/icons/Anverso-logo.png"
            alt="Anverso"
            width={140}
            height={140}
            className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 object-contain"
            unoptimized
          />
        </div>
      </div>

      <nav className="space-y-1.5">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon =
            iconMap[item.id as keyof typeof iconMap] ?? FileText;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={[
                "anverso-focus group flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-all",
                isActive
                  ? "border-[var(--color-green)] bg-[rgba(63,91,74,0.09)]"
                  : "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-paper)]",
              ].join(" ")}
            >
              <Icon
                size={17}
                className={[
                  "shrink-0",
                  isActive
                    ? "text-[var(--color-green)]"
                    : "text-[var(--color-neutral)] group-hover:text-[var(--color-green)]",
                ].join(" ")}
              />

              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold leading-tight text-[var(--color-text)]">
                  {item.label}
                </span>

                <span className="mt-0.5 block truncate text-[11px] md:text-[10px] text-[var(--color-neutral)]">
                  {item.description}
                </span>
              </span>

              {item.count ? (
                <span
                  className={[
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] md:text-[9px] font-bold",
                    isActive
                      ? "bg-[var(--color-green)] text-white"
                      : "bg-[rgba(47,44,45,0.07)] text-[var(--color-neutral)]",
                  ].join(" ")}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}