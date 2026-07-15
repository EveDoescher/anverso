import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

type AdvisorNoteCardProps = {
  title: string;
  note: string;
  author: string;
  onViewAll?: () => void;
  className?: string;
};

export function AdvisorNoteCard({
  title,
  note,
  author,
  onViewAll,
  className = "",
}: AdvisorNoteCardProps) {
  return (
    <Card
      variant="interactive"
      className={[
        "relative min-h-[176px] flex flex-col border-[rgba(198, 125, 41, 0.685)] p-4",
        className,
      ].join(" ")}
      style={{ backgroundColor: "#f8f1e6" }}
    >
      <div className="flex flex-col flex-1">
        <p className="text-[13px] font-bold leading-snug text-[var(--color-text)]">
          {title}
        </p>

        <div className="mt-3 flex gap-2.5 flex-1">
          <span className="-mt-1 font-serif text-[31px] font-bold leading-none text-[var(--color-gold)] opacity-75">
            “
          </span>

          <div>
            <p className="text-[12px] leading-relaxed text-[var(--color-text)]">
              {note}
            </p>

            <p className="mt-2 text-[10.5px] font-bold text-[var(--color-gold)]">
              - {author}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[rgba(145,88,24,0.22)] pt-3 text-right">
          <button
            type="button"
            onClick={onViewAll}
            className="anverso-focus inline-flex min-h-[44px] items-center justify-end gap-1.5 px-2 -mr-2 text-[11.5px] font-bold text-[var(--color-gold)] hover:underline"
          >
            Ver todas
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
}