import { HTMLMotionProps, motion } from "framer-motion";

type RadioProps = Omit<HTMLMotionProps<"input">, "type" | "ref"> & {
  label: string;
};

export function Radio({ label, className = "", ...props }: RadioProps) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "flex cursor-pointer items-center gap-3 text-[13px] font-medium text-[var(--color-text)]",
        className,
      ].join(" ")}
    >
      <motion.input type="radio" className="peer sr-only" {...props} />

      <span
        className={[
          "flex h-[17px] w-[17px] items-center justify-center rounded-full border transition-colors duration-300",
          "border-[var(--color-border)] bg-[var(--color-paper-soft)]",
          "peer-checked:border-[var(--color-green)]",
          "peer-focus-visible:shadow-[0_0_0_3px_rgba(63,91,74,0.18)]",
        ].join(" ")}
      >
        <motion.span 
          initial={false}
          animate={{ scale: props.checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-[7px] w-[7px] rounded-full bg-[var(--color-green)]" 
        />
      </span>

      <span>{label}</span>
    </motion.label>
  );
}