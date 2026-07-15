"use client";

import Image from "next/image";
import {
  ChevronRight,
  Copy,
  Download,
  Edit3,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";

type WorkFileCardProps = {
  title: string;
  updatedAt: string;
  pages: number;
  onOpen?: () => void;
  className?: string;
};

export function WorkFileCard({
  title,
  updatedAt,
  pages,
  onOpen,
  className = "",
}: WorkFileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const actions = [
  { label: "Renomear", feedback: "Renomeado", icon: Edit3 },
  { label: "Duplicar", feedback: "Duplicado", icon: Copy },
  { label: "Baixar", feedback: "Baixado", icon: Download },
  { label: "Excluir", feedback: "Excluído", icon: Trash2 },
];

  return (
    <Card
      variant="interactive"
      className={[
        "relative h-full min-h-[176px] overflow-visible p-4",
        "bg-[rgba(255,251,247,0.74)]",
        className,
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-3">
          <Image
            src="/icons/docs-icon.png"
            alt=""
            width={34}
            height={34}
            className="mt-0.5 shrink-0 object-contain"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(30%) sepia(13%) saturate(957%) hue-rotate(91deg) brightness(92%) contrast(87%)",
            }}
            unoptimized
          />

          <div className="min-w-0 flex-1 pr-7">
            <p className="line-clamp-2 text-[13px] font-bold leading-snug text-[var(--color-text)]">
              {title}
            </p>

            <p className="mt-3 text-[10.5px] leading-relaxed text-[var(--color-neutral)]">
              Atualizado em {updatedAt}
              <br />
              {pages} páginas
            </p>
          </div>

          <div className="absolute right-3 top-3" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="anverso-focus flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-neutral)] hover:bg-[rgba(47,44,45,0.06)] hover:text-[var(--color-green)]"
              aria-label="Mais opções"
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+6px)] z-[90] w-[136px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-paper)] p-1.5 shadow-[0_12px_30px_rgba(47,44,45,0.14)]">
                {actions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        setFeedback(action.feedback);
                        setMenuOpen(false);
                      }}
                      className="flex h-8 w-full items-center gap-2 rounded-[7px] px-2 text-left text-[11px] font-bold text-[var(--color-text)] hover:bg-[rgba(63,91,74,0.08)] hover:text-[var(--color-green)]"
                    >
                      <Icon size={13} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--color-border)] pt-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpen}
              className="anverso-focus inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--color-text)] hover:text-[var(--color-green)]"
            >
              Abrir prévia
              <ChevronRight size={13} />
            </button>

            {feedback ? (
              <span className="max-w-[92px] truncate text-right text-[9.5px] font-bold text-[var(--color-muted)]">
                {feedback}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}