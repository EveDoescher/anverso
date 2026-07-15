import { Check } from "lucide-react";

export type StepperStep = {
  label: string;
  description?: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
};

export function Stepper({
  steps,
  currentStep,
  onStepChange,
  className = "",
}: StepperProps) {
  return (
    <div className={["w-full overflow-x-auto pb-2 sm:pb-0", className].join(" ")}>
      <div
        className="grid min-w-[360px] sm:min-w-0 sm:w-full"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.label} className="relative min-w-0">
              {!isLast ? (
                <div className="absolute left-1/2 right-[-50%] top-[17px] h-px border-t border-dashed border-[var(--color-border)]" />
              ) : null}

              <div className="relative z-10 flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => onStepChange?.(index)}
                  className={[
                    "anverso-focus flex h-[34px] w-[34px] items-center justify-center rounded-full border text-[12px] font-bold transition-all",
                    isActive
                      ? "border-[var(--color-green)] bg-[var(--color-green)] text-white shadow-[var(--shadow-button)]"
                      : isCompleted
                        ? "border-[var(--color-green)] bg-[var(--color-green)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-paper-soft)] text-[var(--color-neutral)] hover:border-[var(--color-green)]",
                  ].join(" ")}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <Check size={15} strokeWidth={2.6} /> : index + 1}
                </button>

                <div className="mt-3 max-w-[92px]">
                  <p
                    className={[
                      "truncate text-[12px] font-bold leading-tight",
                      isActive || isCompleted
                        ? "text-[var(--color-green)]"
                        : "text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>

                  {step.description ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] md:text-[10px] leading-tight text-[var(--color-neutral)]">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}