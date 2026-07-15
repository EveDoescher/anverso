import type { StepperStep } from "@/components/ui/Stepper";

type StepDetailCardProps = {
  steps: StepperStep[];
  currentStep: number;
  description: string;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
};

export function StepDetailCard({
  steps,
  currentStep,
  description,
  onStepChange,
  className = "",
}: StepDetailCardProps) {
  const current = steps[currentStep];

  return (
    <article
      className={[
        "rounded-[14px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4",
        className,
      ].join(" ")}
    >
      <p className="font-serif text-[18px] font-bold text-[var(--color-forest)]">
        {current.label}
      </p>

      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-neutral)]">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {steps.map((step, index) => (
          <button
            key={step.label}
            type="button"
            onClick={() => onStepChange?.(index)}
            className={[
              "anverso-focus h-1.5 rounded-full transition-all",
              index === currentStep
                ? "w-8 bg-[var(--color-green)]"
                : "w-3 bg-[var(--color-border)] hover:bg-[var(--color-neutral)]",
            ].join(" ")}
            aria-label={`Ir para etapa ${step.label}`}
          />
        ))}
      </div>
    </article>
  );
}