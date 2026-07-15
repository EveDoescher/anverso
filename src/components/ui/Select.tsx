"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldHelper } from "./FieldHelper";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  helper?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function Select({
  label,
  helper,
  error,
  placeholder = "Selecione uma opção",
  options,
  value = "",
  onValueChange,
  className = "",
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextValue: string) {
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative block">
      {label ? (
        <label className="mb-3 block text-[14px] font-medium text-[var(--color-text)]">
          {label}
        </label>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={[
          "anverso-focus flex h-9 w-full items-center justify-between gap-3 rounded-[8px] border bg-[var(--color-paper-soft)] px-3",
          "text-left text-[12px] transition-all",
          "disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[rgba(80,79,77,0.58)]",
          error
            ? "border-[var(--color-error)]"
            : open
              ? "border-[var(--color-green)]"
              : "border-[var(--color-border)]",
          selectedOption ? "text-[var(--color-text)]" : "text-[rgba(80,79,77,0.68)]",
          className,
        ].join(" ")}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>

        <ChevronDown
          size={16}
          className={[
            "shrink-0 text-[var(--color-text)] transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm sm:hidden" 
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }} 
            />
            <div className="fixed left-4 right-4 top-1/2 z-[80] -translate-y-1/2 sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+6px)] sm:-translate-y-0 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="pointer-events-auto overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[0_24px_48px_rgba(47,44,45,0.2)] sm:rounded-[10px] sm:shadow-[0_14px_34px_rgba(47,44,45,0.12)] origin-center sm:origin-top"
              >
                <div className="max-h-[50vh] sm:max-h-56 overflow-y-auto p-2 sm:p-1.5">
                  {options.map((option) => {
                    const selected = option.value === value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={option.disabled}
                        onClick={() => handleSelect(option.value)}
                        className={[
                          "flex h-12 sm:h-8 w-full items-center justify-between gap-3 rounded-[7px] px-3 sm:px-2.5 text-left text-[14px] sm:text-[12px] transition-all",
                          selected
                            ? "bg-[rgba(63,91,74,0.10)] font-bold text-[var(--color-green)]"
                            : "text-[var(--color-text)] hover:bg-[rgba(47,44,45,0.05)]",
                          "disabled:cursor-not-allowed disabled:opacity-45",
                        ].join(" ")}
                      >
                        <span>{option.label}</span>
                        {selected ? <Check size={16} className="sm:w-3.5 sm:h-3.5" /> : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      {error ? (
        <FieldHelper variant="error">{error}</FieldHelper>
      ) : helper ? (
        <FieldHelper variant="neutral">{helper}</FieldHelper>
      ) : null}
    </div>
  );
}