import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

type ObservationBubbleProps = {
  text: string;
  className?: string;
};

export function ObservationBubble({
  text,
  className = "",
}: ObservationBubbleProps) {
  return (
    <div className={["group relative inline-flex", className].join(" ")}>
      <motion.button
        type="button"
        aria-label={text}
        whileHover={{ scale: 1.15, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={[
          "anverso-focus flex h-8 w-8 items-center justify-center rounded-full",
          "border border-[var(--color-border)] bg-[var(--color-paper-soft)]",
          "text-[var(--color-neutral)] transition-colors",
          "hover:border-[var(--color-green)] hover:text-[var(--color-green)] hover:bg-[var(--color-paper)]",
        ].join(" ")}
      >
        <HelpCircle size={26} />
      </motion.button>

      <span
        className={[
          "pointer-events-none absolute bottom-[calc(100%+12px)] right-0 z-50",
          "w-[190px] rounded-[10px] bg-[var(--color-green)] px-3 py-2 text-center",
          "text-[12px] font-bold leading-tight text-white shadow-[var(--shadow-button)]",
          "opacity-0 translate-y-1 scale-[0.98] transition-all duration-200",
          "group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
          "group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100",
          "after:absolute after:-bottom-2 after:right-2 after:h-4 after:w-4 after:rotate-45 after:bg-[var(--color-green)]",
        ].join(" ")}
      >
        {text}
      </span>
    </div>
  );
}