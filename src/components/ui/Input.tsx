import type { ComponentType, InputHTMLAttributes } from "react";
import { FieldHelper } from "./FieldHelper";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: ComponentType<{ size?: number; className?: string }>;
  rightIcon?: ComponentType<{ size?: number; className?: string }>;
};

export function Input({
  label,
  helper,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  disabled,
  ...props
}: InputProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-3 block text-[14px] font-medium text-[var(--color-text)]">
          {label}
        </span>
      ) : null}

      <span className="relative block">
        {LeftIcon ? (
          <LeftIcon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral)]"
          />
        ) : null}

        <input
          disabled={disabled}
          className={[
            "anverso-focus h-9 w-full rounded-[8px] border bg-[var(--color-paper-soft)] px-3 text-[12px]",
            "text-[var(--color-text)] placeholder:text-[rgba(80,79,77,0.62)] transition-all",
            "disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[rgba(80,79,77,0.58)]",
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-green)]",
            LeftIcon ? "pl-9" : "",
            RightIcon ? "pr-9" : "",
            className,
          ].join(" ")}
          {...props}
        />

        {RightIcon ? (
          <RightIcon
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral)]"
          />
        ) : null}
      </span>

      {error ? (
        <FieldHelper variant="error">{error}</FieldHelper>
      ) : helper ? (
        <FieldHelper variant="neutral">{helper}</FieldHelper>
      ) : null}
    </label>
  );
}