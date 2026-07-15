"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motionEase, motionTimings } from "@/components/ui/MotionPrimitives";

type ShowcasePanelProps = {
  number?: number;
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  overflow?: "hidden" | "visible";
};

export function ShowcasePanel({
  number,
  title,
  children,
  className = "",
  contentClassName = "",
  overflow = "hidden",
}: ShowcasePanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: motionTimings.item, ease: motionEase }}
      className={[
        "relative p-4 sm:p-6 lg:p-10 rounded-none sm:rounded-[16px] border-y border-x-0 sm:border-x border-[rgba(92,51,32,0.15)]",
        "w-[calc(100%+32px)] -ml-4 max-w-none sm:w-full sm:ml-0",
        overflow === "visible" ? "overflow-visible" : "overflow-hidden",
        className,
      ].join(" ")}
      style={{
        background: "rgba(92,51,32,0.015)",
        backgroundImage: "radial-gradient(rgba(92,51,32,0.1) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, rgba(92,51,32,0.3) 0%, transparent 100%)" }} />

      <div className="mb-8 flex items-baseline gap-3 border-b border-[rgba(92,51,32,0.1)] pb-4">
        {number ? (
          <span
            className="font-mono text-[11px] font-bold tracking-widest"
            style={{ color: "var(--color-gold)" }}
          >
            {String(number).padStart(2, "0")}
          </span>
        ) : null}
        <h4
          className="font-serif text-[18px] font-bold"
          style={{ color: "var(--color-espresso)" }}
        >
          {title}
        </h4>
      </div>

      <div className={contentClassName}>{children}</div>
    </motion.section>
  );
}
