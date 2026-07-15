"use client";

import Image from "next/image";
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Cloud,
  Download,
  Edit2,
  Eye,
  FileText,
  Info,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { Chip } from "@/components/ui/Chip";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const PNG_ASSETS = [
  { file: "docs-icon.png", name: "Documento", category: "Funcional" },
  { file: "bookmark.png", name: "Favorito", category: "Funcional" },
  { file: "edit.png", name: "Editar", category: "Funcional" },
  { file: "delete.png", name: "Excluir", category: "Funcional" },
  { file: "download.png", name: "Download", category: "Funcional" },
  { file: "calendar.png", name: "Data", category: "Funcional" },
  { file: "OK.png", name: "Sucesso", category: "Estado" },
  { file: "ATENTION.png", name: "Atenção", category: "Estado" },
  { file: "INFORMATION.png", name: "Informação", category: "Estado" },
  { file: "check-box-on.png", name: "Checkbox on", category: "Input" },
  { file: "radio-btn-on.png", name: "Radio on", category: "Input" },
  { file: "leaves.png", name: "Folhas", category: "Marca" },
  { file: "leaves-2.png", name: "Folhas 2", category: "Marca" },
  { file: "leaves-3.png", name: "Folhas 3", category: "Marca" },
  { file: "xicara.png", name: "Xícara", category: "Marca" },
  { file: "diskette.png", name: "Disquete", category: "Funcional" },
  { file: "cloud-computing.png", name: "Nuvem de Upload", category: "Funcional" },
];

const LUCIDE: { Icon: IconComponent; name: string; category: string }[] = [
  { Icon: FileText, name: "FileText", category: "Documento" },
  { Icon: Eye, name: "Eye", category: "Ação" },
  { Icon: Download, name: "Download", category: "Ação" },
  { Icon: Edit2, name: "Edit2", category: "Ação" },
  { Icon: Trash2, name: "Trash2", category: "Ação" },
  { Icon: Search, name: "Search", category: "Campo" },
  { Icon: Calendar, name: "Calendar", category: "Campo" },
  { Icon: ChevronDown, name: "ChevronDown", category: "Campo" },
  { Icon: Bookmark, name: "Bookmark", category: "Ação" },
  { Icon: MoreHorizontal, name: "MoreHorizontal", category: "Ação" },
  { Icon: Info, name: "Info", category: "Estado" },
  { Icon: AlertTriangle, name: "AlertTriangle", category: "Estado" },
  { Icon: Cloud, name: "Cloud", category: "Upload" },
  { Icon: Check, name: "Check", category: "Estado" },
  { Icon: CheckCircle2, name: "CheckCircle2", category: "Estado" },
  { Icon: XCircle, name: "XCircle", category: "Estado" },
  { Icon: Loader2, name: "Loader2", category: "Estado" },
  { Icon: Plus, name: "Plus", category: "Ação" },
  { Icon: MessageCircle, name: "MessageCircle", category: "Voz" },
];

function PngCard({ file, name, category }: { file: string; name: string; category: string }) {
  return (
    <article className="p-4 text-center transition-all hover:bg-[rgba(92,51,32,0.03)] border border-[rgba(92,51,32,0.1)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-transparent">
        <Image
          src={`/icons/${file}`}
          alt=""
          width={32}
          height={32}
          className="object-contain"
          style={{
            /* Aproximação CSS para a cor var(--color-espresso) #2c1810 a partir do preto */
            filter: "brightness(0) saturate(100%) invert(11%) sepia(26%) saturate(2203%) hue-rotate(347deg) brightness(92%) contrast(87%)",
          }}
          unoptimized
        />
      </div>
      <p className="mt-3 text-[11px] font-serif font-bold text-[var(--color-espresso)]">
        {name}
      </p>
      <p className="mt-1 text-[11px] md:text-[9px] uppercase tracking-widest text-[var(--color-neutral)]">{category}</p>
    </article>
  );
}

function LucideCard({ Icon, name, category }: { Icon: IconComponent; name: string; category: string }) {
  return (
    <article className="p-4 text-center transition-all hover:bg-[rgba(92,51,32,0.03)] border border-[rgba(92,51,32,0.1)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center text-[var(--color-espresso)]">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-[11px] font-serif font-bold text-[var(--color-espresso)]">
        {name}
      </p>
      <p className="mt-1 text-[11px] md:text-[9px] uppercase tracking-widest text-[var(--color-neutral)]">{category}</p>
    </article>
  );
}

export function IconesSection() {
  const [mode, setMode] = useState<"marca" | "ui">("marca");
  const [filter, setFilter] = useState("Todos");

  const categories =
    mode === "marca"
      ? ["Todos", ...Array.from(new Set(PNG_ASSETS.map((item) => item.category)))]
      : ["Todos", ...Array.from(new Set(LUCIDE.map((item) => item.category)))];

  const pngItems =
    filter === "Todos"
      ? PNG_ASSETS
      : PNG_ASSETS.filter((item) => item.category === filter);

  const lucideItems =
    filter === "Todos" ? LUCIDE : LUCIDE.filter((item) => item.category === filter);

  function changeMode(nextMode: "marca" | "ui") {
    setMode(nextMode);
    setFilter("Todos");
  }

  return (
    <SectionShell
      id="icones"
      label="Ícones"
      pill="Galeria"
      intro="Ícones de marca entram como assinatura visual. Ícones de biblioteca resolvem a maior parte das ações e controles da interface."
    >
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
        <aside className="p-6 border border-[rgba(92,51,32,0.15)] bg-[rgba(92,51,32,0.01)]">
          <p className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--color-espresso)]">
            Categorias e filtros
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => changeMode("marca")}
              className={[
                "anverso-focus py-3 text-[11px] font-serif font-bold transition-all border-b-2",
                mode === "marca"
                  ? "border-[var(--color-espresso)] text-[var(--color-espresso)]"
                  : "border-transparent text-[var(--color-neutral)] hover:text-[var(--color-espresso)]",
              ].join(" ")}
            >
              Ícones Customizados
            </button>
              <button
                type="button"
                onClick={() => changeMode("ui")}
                className={[
                  "anverso-focus py-3 text-[11px] font-serif font-bold transition-all border-b-2",
                  mode === "ui"
                    ? "border-[var(--color-espresso)] text-[var(--color-espresso)]"
                    : "border-transparent text-[var(--color-neutral)] hover:text-[var(--color-espresso)]",
                ].join(" ")}
              >
                Ícones de Biblioteca
              </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category}
                selected={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </Chip>
            ))}
          </div>

          <p className="mt-8 text-[12px] font-serif italic leading-relaxed text-[var(--color-neutral)] pt-6 border-t border-[rgba(92,51,32,0.1)]">
            Regra: use ilustrações para momentos expressivos e vazios; use os ícones de biblioteca (como Lucide) para ações repetidas, botões e navegação estrutural.
          </p>
        </aside>

        <div className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-[-1px]">
            {mode === "marca"
              ? pngItems.map((item) => <PngCard key={`${item.file}-${item.name}`} {...item} />)
              : lucideItems.map((item) => <LucideCard key={item.name} {...item} />)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
