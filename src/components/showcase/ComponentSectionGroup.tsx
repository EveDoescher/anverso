"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motionEase, motionTimings } from "@/components/ui/MotionPrimitives";

type ComponentSectionGroupProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  /**
   * Quando true, aplica cores de texto para fundos escuros.
   * Default agora é false para combinar com a nova diretriz de "papel".
   */
  dark?: boolean;
};

export function ComponentSectionGroup({
  eyebrow,
  title,
  description,
  children,
  dark = false,
}: ComponentSectionGroupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: motionTimings.section, ease: motionEase }}
      className="relative mb-16"
    >
      {/* Cabeçalho do grupo */}
      <div className="mb-8 flex items-end gap-5">
        <div className="max-w-[760px]">
          <p
            className="text-[11px] md:text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{
              color: dark ? "rgba(212,170,92,0.75)" : "var(--color-gold)",
            }}
          >
            {eyebrow}
          </p>

          <h3
            className="mt-2 font-serif font-bold leading-tight"
            style={{
              fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)",
              color: dark ? "var(--color-ink-inv)" : "var(--color-espresso)",
            }}
          >
            {title}
          </h3>

          {description && (
            <p
              className="mt-3 text-[13px] font-serif italic leading-relaxed"
              style={{
                color: dark ? "var(--color-muted-inv)" : "var(--color-neutral)",
              }}
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="mb-4 hidden h-px flex-1 lg:block"
          style={{
            background: dark
              ? "linear-gradient(90deg, rgba(181,137,42,0.30), transparent)"
              : "linear-gradient(90deg, rgba(92,51,32,0.15), transparent)",
          }}
        />
      </div>

      {/* Showcase Grid */}
      <div className="grid gap-6 [&>*]:min-w-0">
        {children}
      </div>
    </motion.section>
  );
}
