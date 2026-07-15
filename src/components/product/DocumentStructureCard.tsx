import { Check, Circle, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/Card";

type StructureStatus = "done" | "pending" | "optional";

type StructureItem = {
  label: string;
  status: StructureStatus;
};

type DocumentStructureCardProps = {
  title: string;
  description: string;
  items: StructureItem[];
  className?: string;
};

const statusMap = {
  done: {
    icon: Check,
    className: "bg-[var(--color-green)] text-white",
  },
  pending: {
    icon: Clock3,
    className: "bg-[rgba(145,88,24,0.12)] text-[var(--color-warning)]",
  },
  optional: {
    icon: Circle,
    className: "bg-[rgba(47,44,45,0.06)] text-[var(--color-neutral)]",
  },
};

export function DocumentStructureCard({
  title,
  description,
  items,
  className = "",
}: DocumentStructureCardProps) {
  return (
    <Card variant="paper" className={className}>
      <p className="font-serif text-[18px] font-bold leading-tight text-[var(--color-forest)]">
        {title}
      </p>

      <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-neutral)]">
        {description}
      </p>

      <div className="mt-4 space-y-2.5">
        {items.map((item) => {
          const status = statusMap[item.status];
          const Icon = status.icon;

          return (
            <div key={item.label} className="flex items-center gap-2.5">
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  status.className,
                ].join(" ")}
              >
                <Icon size={11} strokeWidth={2.6} />
              </span>

              <span className="text-[12px] font-medium text-[var(--color-text)]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}