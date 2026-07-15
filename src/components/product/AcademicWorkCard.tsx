import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AcademicWorkCardProps = {
  title: string;
  description: string;
  badge?: string;
  status?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function AcademicWorkCard({
  title,
  description,
  badge,
  status,
  selected = false,
  onSelect,
  className = "",
}: AcademicWorkCardProps) {
  return (
    <Card
      variant="interactive"
      className={[
        "relative min-h-[178px]",
        selected ? "border-[var(--color-green)] bg-[rgba(63,91,74,0.06)]" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <FileText
          size={22}
          className="mt-0.5 shrink-0 text-[var(--color-green)]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-serif text-[18px] font-bold leading-tight text-[var(--color-forest)]">
              {title}
            </p>

            {badge ? <Badge tone="gold">{badge}</Badge> : null}
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-neutral)]">
            {description}
          </p>
        </div>
      </div>

      {status ? (
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-neutral)]">
          {status}
        </p>
      ) : null}

      <Button
        variant={selected ? "primary" : "ghost"}
        size="sm"
        align="center"
        trailingIcon={false}
        onClick={onSelect}
        className="mt-4 w-full"
      >
        {selected ? "Selecionado" : "Selecionar modelo"}
      </Button>
    </Card>
  );
}