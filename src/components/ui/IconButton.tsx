import type { ComponentType } from "react";
import { HTMLMotionProps, motion } from "framer-motion";

type IconButtonVariant = "cream" | "paper" | "forest" | "gold" | "ghost" | "primary";

type IconButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  cream:
    "bg-[var(--color-cream-soft)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-paper)]",
  paper:
    "bg-[var(--color-paper-soft)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-paper)]",
  forest:
    "bg-[var(--color-forest)] border-transparent text-white hover:brightness-110",
  gold:
    "bg-[var(--color-gold)] border-transparent text-white hover:brightness-110",
  ghost:
    "bg-transparent border-transparent text-[var(--color-neutral)] hover:bg-[rgba(47,44,45,0.06)]",
  primary:
    "bg-[var(--color-green)] border-transparent text-white shadow-[var(--shadow-button)] hover:brightness-110",
};

export function IconButton({
  icon: Icon,
  label,
  variant = "cream",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
      <motion.button
          type={type}
          aria-label={label}
          title={label}
          whileHover={props.disabled ? {} : { scale: 1.05 }}
          transition={props.disabled ? {} : { duration: 0.2, ease: "easeOut" }}
          whileTap={props.disabled ? {} : { scale: 0.9 }}
          className={[
              "anverso-focus group relative flex h-[44px] w-[44px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[10px] border transition-colors",
              "disabled:pointer-events-none disabled:opacity-30 disabled:grayscale",
              variantClasses[variant],
              className,
          ].join(" ")}
          {...props}
      >
      <Icon size={17} className="transition-transform duration-300 group-hover:scale-110" />

      <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-forest)] px-2 py-0.5 text-[11px] md:text-[9px] text-white opacity-0 shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:opacity-100">
        {label}
      </span>
    </motion.button>
  );
}