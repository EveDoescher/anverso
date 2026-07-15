import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type ProjectProgressCardProps = {
  eyebrow: string;
  title: string;
  meta: string;
  progress: number;
  onContinue?: () => void;
  className?: string;
};

function getProgressBadge(progress: number) {
  if (progress >= 100) {
    return {
      label: "Finalizado",
      tone: "success" as const,
    };
  }

  if (progress >= 75) {
    return {
      label: "Quase lá",
      tone: "success" as const,
    };
  }

  if (progress >= 40) {
    return {
      label: "Em andamento",
      tone: "warning" as const,
    };
  }

  return {
    label: "Começando",
    tone: "info" as const,
  };
}

export function ProjectProgressCard({
  eyebrow,
  title,
  meta,
  progress,
  onContinue,
  className = "",
}: ProjectProgressCardProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const badge = getProgressBadge(safeProgress);

  return (
    <Card
      variant="interactive"
      className={[
        "relative h-full min-h-[176px] overflow-hidden p-4",
        "bg-[rgba(255,251,247,0.74)]",
        className,
      ].join(" ")}
    >
      <Image
        src="/icons/leaves.png"
        alt=""
        width={78}
        height={58}
        className="pointer-events-none absolute -right-5 -top-2 opacity-[0.10]"
        unoptimized
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-green)]">
            {eyebrow}
          </p>

          <Badge tone={badge.tone} className="-mt-1">
            {badge.label}
          </Badge>
        </div>

        <p className="mt-3 text-[15px] font-bold leading-snug text-[var(--color-text)]">
          {title}
        </p>

        <p className="mt-1 text-[10.5px] text-[var(--color-neutral)]">
          {meta}
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] md:text-[10px] font-bold text-[var(--color-neutral)]">
            <span>Progresso</span>
            <span>{safeProgress}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(207,205,198,0.75)]">
            <div
              className="h-full rounded-full bg-[var(--color-green)] transition-all duration-500"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={onContinue}
            className="anverso-focus inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--color-green)] hover:underline"
          >
            Continuar
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
}