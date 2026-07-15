import Image from "next/image";
import { motion } from "framer-motion";

type UploadDropzoneProps = {
  title: string;
  description: string;
  iconSrc?: string;
  iconAlt?: string;
  onClick?: () => void;
  uploaded?: boolean;
  className?: string;
};

export function UploadDropzone({
  title,
  description,
  iconSrc = "/icons/cloud-computing.png",
  iconAlt = "",
  onClick,
  uploaded = false,
  className = "",
}: UploadDropzoneProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -4, backgroundColor: "var(--color-paper)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "anverso-focus group w-full rounded-[14px] border border-dashed border-[var(--color-border)] bg-[var(--color-paper-soft)] px-5 py-5 text-center",
        "transition-colors hover:border-[var(--color-green)]",
        className,
      ].join(" ")}
    >
      <motion.div 
        className="mb-3 flex justify-center"
        animate={uploaded ? { y: [-2, -12, 0], scale: [1, 1.2, 1] } : {}}
        transition={uploaded ? { duration: 0.6, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 10 }}
        whileHover={!uploaded ? { y: -5, scale: 1.1 } : {}}
      >
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={58}
          height={58}
          className="object-contain opacity-75"
          unoptimized
        />
      </motion.div>

      <p className="mx-auto max-w-[230px] text-[16px] font-bold leading-tight text-[var(--color-text)]">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-[260px] text-[12px] leading-relaxed text-[var(--color-neutral)]">
        {description}
      </p>
    </motion.button>
  );
}