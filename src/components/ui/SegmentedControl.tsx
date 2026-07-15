type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={[
        "inline-flex w-full sm:w-auto overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-[var(--color-paper-soft)]",
        className,
      ].join(" ")}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "anverso-focus flex-1 whitespace-nowrap h-8 px-2 sm:px-4 text-[11px] font-bold transition-all",
              selected
                ? "bg-[var(--color-green)] text-white"
                : "text-[var(--color-neutral)] hover:bg-[var(--color-paper)]",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}