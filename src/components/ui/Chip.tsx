import { X } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { HTMLMotionProps, motion } from "framer-motion";

type ChipProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children?: ReactNode;
};

export function Chip({
  selected = false,
  removable = false,
  onRemove,
  children,
  className = "",
  type = "button",
  ...props
}: ChipProps) {
  function handleRemove(event: MouseEvent<HTMLSpanElement>) {
    event.stopPropagation();
    onRemove?.();
  }

  return (
    <motion.button
      type={type}
      whileHover={props.disabled ? {} : { scale: 1.05 }}
      whileTap={props.disabled ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "anverso-focus group inline-flex h-7 items-center justify-center gap-1.5 rounded-full border px-3",
        "text-[11px] font-bold transition-colors",
        selected
          ? "border-[var(--color-green)] bg-[var(--color-green)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-paper-soft)] text-[var(--color-text)] hover:bg-[var(--color-paper)]",
        removable ? "pr-2" : "",
        className,
      ].join(" ")}
      {...props}
    >
      <span>{children}</span>

      {removable ? (
        <span
          role="button"
          aria-label={`Remover ${children}`}
          tabIndex={-1}
          onClick={handleRemove}
          className={[
            "flex h-4 w-4 items-center justify-center rounded-full transition-all group-hover:rotate-90 duration-300",
            selected
              ? "text-white/85 hover:bg-white/15 hover:text-white"
              : "text-[var(--color-neutral)] hover:bg-[rgba(47,44,45,0.08)] hover:text-[var(--color-text)]",
          ].join(" ")}
        >
          <X size={10} strokeWidth={2.4} />
        </span>
      ) : null}
    </motion.button>
  );
}