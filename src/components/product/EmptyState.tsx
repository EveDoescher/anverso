import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  onAction?: () => void;
  actionCount?: number;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  imageSrc = "/icons/xicara.png",
  imageAlt = "",
  onAction,
  actionCount = 0,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={[
        "rounded-[14px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] px-5 py-4 text-center",
        className,
      ].join(" ")}
    >
      <motion.div 
        key={actionCount}
        initial={{ y: -20, scale: 0.5, opacity: 0, rotate: -20 }}
        animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        whileHover={{ 
          rotate: [-5, 5, -5, 5, 0], 
          scale: 1.15,
          transition: { duration: 0.5, ease: "easeInOut" }
        }}
        className="mb-3 flex justify-center"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={72}
          height={72}
          className="object-contain"
          unoptimized
        />
      </motion.div>

      <p className="text-[16px] font-bold leading-tight text-[var(--color-text)]">
        {title}
      </p>

      <p className="mx-auto mt-1.5 max-w-[240px] text-[12px] leading-relaxed text-[var(--color-neutral)]">
        {description}
      </p>

      {actionLabel ? (
        <Button
          variant="primary"
          size="sm"
          align="center"
          onClick={onAction}
          className="w-full sm:w-auto mx-auto mt-4"
        >
          {actionLabel}
        </Button>
      ) : null}
    </motion.article>
  );
}