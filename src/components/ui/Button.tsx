import { ChevronRight, Loader2 } from "lucide-react";
import type { ComponentType } from "react";
import { HTMLMotionProps, motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";
type ButtonAlign = "left" | "center";

type ButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  align?: ButtonAlign;
  icon?: ComponentType<{ size?: number; className?: string }>;
  trailingIcon?: ComponentType<{ size?: number; className?: string }> | false;
  loading?: boolean;
  children?: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-green)] text-white border-transparent shadow-[var(--shadow-button)] hover:brightness-110",
  secondary:
    "bg-transparent text-[var(--color-green)] border-[var(--color-green)] hover:bg-[var(--color-success-soft)]",
  ghost:
    "bg-[var(--color-paper-soft)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-paper)]",
  quiet:
    "bg-transparent text-[var(--color-neutral)] border-transparent hover:bg-[rgba(47,44,45,0.06)]",
  danger:
    "bg-[var(--color-error-bg-soft)] text-[var(--color-error)] border-[var(--color-error)] hover:bg-[var(--color-error-bg)]",
  gold:
    "bg-[var(--color-gold)] text-white border-transparent shadow-[var(--shadow-gold)] hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 py-1.5 px-3 text-xs rounded-[10px]",
  md: "min-h-[43px] py-2 px-4 text-[14px] rounded-[10px]",
  lg: "min-h-[52px] py-2.5 px-5 text-[17px] rounded-[11px]",
};

const alignClasses: Record<ButtonAlign, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
};

export function Button({
  variant = "primary",
  size = "md",
  align = "left",
  icon: Icon,
  trailingIcon: TrailingIcon = ChevronRight,
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const iconSize = size === "sm" ? 13 : 15;

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "anverso-focus group inline-flex min-w-0 items-center gap-3 border font-bold transition-colors",
        "disabled:pointer-events-none disabled:opacity-45",
        sizeClasses[size],
        alignClasses[align],
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : Icon ? (
        <Icon size={iconSize} className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3" />
      ) : null}

      <span className="whitespace-normal break-words text-balance">{children}</span>

      {TrailingIcon ? (
        <TrailingIcon 
          size={iconSize + 2} 
          className={[
            align === "left" ? "ml-auto" : "",
            "transition-transform duration-300 ease-out group-hover:translate-x-1"
          ].join(" ")} 
        />
      ) : null}
    </motion.button>
  );
}