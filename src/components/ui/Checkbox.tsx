import { HTMLMotionProps, motion } from "framer-motion";

type CheckboxProps = Omit<HTMLMotionProps<"input">, "type" | "ref"> & {
  label: string;
};

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "flex cursor-pointer items-center gap-3 text-[13px] font-medium text-[var(--color-text)]",
        className,
      ].join(" ")}
    >
      <motion.input type="checkbox" className="peer sr-only" {...props} />

      <span
        className={[
          "flex h-[17px] w-[17px] items-center justify-center rounded-[4px] border transition-colors duration-300",
          "border-[var(--color-border)] bg-[var(--color-paper-soft)] text-white",
          "peer-checked:border-[var(--color-green)] peer-checked:bg-[var(--color-green)]",
          "peer-focus-visible:shadow-[0_0_0_3px_rgba(63,91,74,0.18)]",
        ].join(" ")}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3 text-white"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: props.checked ? 1 : 0,
            opacity: props.checked ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </span>

      <span>{label}</span>
    </motion.label>
  );
}