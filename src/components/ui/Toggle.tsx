import { HTMLMotionProps, motion } from "framer-motion";

type ToggleProps = Omit<HTMLMotionProps<"button">, "onChange" | "ref"> & {
  checked?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
};

export function Toggle({
  checked = false,
  label,
  onCheckedChange,
  className = "",
  type = "button",
  ...props
}: ToggleProps) {
  return (
    <motion.button
      type={type}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange?.(!checked)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "anverso-focus inline-flex items-center gap-3 text-left text-[12px] font-medium text-[var(--color-text)]",
        className,
      ].join(" ")}
      {...props}
    >
      <span className="min-w-0 flex-1">{label}</span>

      <span
        className={[
          "relative h-[20px] w-[38px] rounded-full border transition-colors duration-300",
          checked
            ? "border-[var(--color-green)] bg-[var(--color-green)]"
            : "border-[var(--color-border)] bg-[var(--color-surface-muted)]",
        ].join(" ")}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={[
            "absolute top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full bg-white shadow-sm",
            checked ? "left-[20px]" : "left-[3px]",
          ].join(" ")}
        />
      </span>
    </motion.button>
  );
}