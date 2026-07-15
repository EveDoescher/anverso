"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const viewport = { once: true, amount: 0.18 };
export const motionEase = [0.16, 1, 0.3, 1] as const;
export const motionTimings = {
  section: 0.62,
  item: 0.34,
  micro: 0.2,
};

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: motionTimings.section, ease: motionEase, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PressableMotion({
  children,
  className = "",
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.045,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: motionTimings.item, ease: motionEase },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
