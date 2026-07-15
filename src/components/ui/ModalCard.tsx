import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ModalCardProps = {
  title: string;
  description?: string;
  visual?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ModalCard({
  title,
  description,
  visual,
  children,
  className = "",
}: ModalCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={[
        "rounded-[14px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] px-5 py-4 text-center",
        "shadow-none",
        className,
      ].join(" ")}
    >
      {visual ? (
        <div className="mb-3 flex justify-center">
          {visual}
        </div>
      ) : null}

      <p className="mx-auto max-w-[230px] text-[18px] font-bold leading-tight text-[var(--color-text)]">
        {title}
      </p>

      {description ? (
        <p className="mx-auto mt-2 max-w-[260px] text-[12px] leading-relaxed text-[var(--color-neutral)]">
          {description}
        </p>
      ) : null}

      {children ? <div className="mt-5">{children}</div> : null}
    </motion.article>
  );
}