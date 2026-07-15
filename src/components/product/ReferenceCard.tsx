import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type ReferenceCardProps = {
  title: string;
  source: string;
  status: "valid" | "review" | "missing";
  className?: string;
};

const statusInfo = {
  valid: {
    label: "Formatada",
    tone: "success" as const,
  },
  review: {
    label: "Revisar",
    tone: "warning" as const,
  },
  missing: {
    label: "Incompleta",
    tone: "error" as const,
  },
};

export function ReferenceCard({
  title,
  source,
  status,
  className = "",
}: ReferenceCardProps) {
  const info = statusInfo[status];

  return (
    <Card variant="cream" className={className}>
      <div className="flex items-start gap-3">
        <BookOpen
          size={21}
          className="mt-0.5 shrink-0 text-[var(--color-green)]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-bold leading-snug text-[var(--color-text)]">
              {title}
            </p>

            <Badge tone={info.tone}>{info.label}</Badge>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-neutral)]">
            {source}
          </p>

          <button
            type="button"
            className="anverso-focus mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-[11px] font-bold text-[var(--color-green)] hover:underline"
          >
            Ver detalhes
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </Card>
  );
}