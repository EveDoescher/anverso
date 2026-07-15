"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldHelper } from "./FieldHelper";

type DateInputProps = {
  label?: string;
  helper?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function parseDate(value?: string) {
  if (!value) return null;

  const [day, month, year] = value.split("/").map(Number);

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function DateInput({
  label,
  helper,
  error,
  value = "",
  placeholder = "dd/mm/aaaa",
  onValueChange,
  className = "",
  disabled = false,
}: DateInputProps) {
  const parsedValue = parseDate(value);
  const today = useMemo(() => new Date(), []);

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parsedValue ?? today);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDayOfMonth.getDay();

  const calendarDays = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
    if (index < startOffset) return null;

    return new Date(year, month, index - startOffset + 1);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeMonth(direction: -1 | 1) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function selectDate(date: Date) {
    onValueChange?.(formatDate(date));
    setViewDate(date);
    setOpen(false);
  }

  function isSelected(date: Date) {
    return parsedValue?.toDateString() === date.toDateString();
  }

  function isToday(date: Date) {
    return today.toDateString() === date.toDateString();
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
          value ? "text-[var(--color-text)]" : "text-[rgba(80,79,77,0.68)]",
          className,
        ].join(" ")}
      >
        <span>{value || placeholder}</span>
        <Calendar size={15} className="shrink-0 text-[var(--color-text)]" />
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
            <div className="fixed left-1/2 top-1/2 z-[80] -translate-x-1/2 -translate-y-1/2 sm:absolute sm:left-0 sm:top-[calc(100%+6px)] sm:translate-x-0 sm:translate-y-0 pointer-events-none w-[300px] sm:w-[248px]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="pointer-events-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[0_24px_48px_rgba(47,44,45,0.2)] sm:rounded-[12px] sm:p-3 sm:shadow-[0_14px_34px_rgba(47,44,45,0.12)] origin-center sm:origin-top-left"
              >
                <div className="mb-4 sm:mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="anverso-focus flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-[7px] text-[var(--color-text)] hover:bg-[rgba(47,44,45,0.06)]"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft size={18} className="sm:w-[15px] sm:h-[15px]" />
                  </button>

                  <p className="text-[14px] sm:text-[12px] font-bold capitalize text-[var(--color-text)]">
                    {months[month]} {year}
                  </p>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="anverso-focus flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-[7px] text-[var(--color-text)] hover:bg-[rgba(47,44,45,0.06)]"
                    aria-label="Próximo mês"
                  >
                    <ChevronRight size={18} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                </div>

                <div className="mb-2 sm:mb-1 grid grid-cols-7 gap-1">
                  {weekdays.map((weekday, index) => (
                    <span
                      key={`${weekday}-${index}`}
                      className="flex h-8 sm:h-6 items-center justify-center text-[12px] sm:text-[11px] font-bold text-[var(--color-neutral)]"
                    >
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) =>
                    date ? (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => selectDate(date)}
                        className={[
                          "anverso-focus flex h-9 sm:h-7 items-center justify-center rounded-[8px] sm:rounded-[7px] text-[13px] sm:text-[11px] font-medium transition-all",
                          isSelected(date)
                            ? "bg-[var(--color-green)] text-white"
                            : isToday(date)
                              ? "border border-[var(--color-green)] text-[var(--color-green)]"
                              : "text-[var(--color-text)] hover:bg-[rgba(47,44,45,0.06)]",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <span key={`empty-${index}`} />
                    ),
                  )}
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