import type { TextareaHTMLAttributes } from "react";
import { FieldHelper } from "./FieldHelper";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helper?: string;
  error?: string;
  counter?: boolean;
};

export function Textarea({
  label,
  helper,
  error,
  counter = false,
  maxLength,
  value,
  className = "",
  ...props
}: TextareaProps) {
  const valueLength = typeof value === "string" ? value.length : 0;

  return (
    <label className="block">
      {label ? (
        <span className="mb-3 block text-[14px] font-medium text-[var(--color-text)]">
          {label}
        </span>
      ) : null}

      <span className="relative block">
        <textarea
          value={value}
          maxLength={maxLength}
          className={[
            "anverso-focus min-h-[92px] w-full resize-none rounded-[8px] border bg-[var(--color-paper-soft)] px-3 py-2.5",
            "text-[12px] text-[var(--color-text)] placeholder:text-[rgba(80,79,77,0.62)] transition-all",
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-green)]",
            counter ? "pb-6" : "",
            className,
          ].join(" ")}
          {...props}
        />

        {counter && maxLength ? (
          <span className="absolute bottom-2 right-3 text-[12px] text-[var(--color-neutral)]">
            {value?.toString().length || 0}/{maxLength}
          </span>
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