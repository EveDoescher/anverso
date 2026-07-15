"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Reveal, motionEase, motionTimings } from "@/components/ui/MotionPrimitives";

export function SectionShell({
  id,
  label,
  pill,
  children,
  intro,
}: {
  id: string;
  label: string;
  pill?: string;
  intro?: string;
  children: ReactNode;
}) {
  const number = {
    marca: "01",
    voz: "02",
    cores: "03",
    tipografia: "04",
    componentes: "05",
    icones: "06",
  }[id] || "00";

  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { amount: 0.4 });

  return (
    <section id={id} className="relative scroll-mt-0 pb-24 md:pb-36">
      <div className="guide-container relative z-10 px-4 md:px-8">
        {/* Container que força o título a ocupar uma tela inteira, isolando-o do conteúdo */}
        <div 
          ref={headerRef}
          className="section-content-offset relative flex min-h-[100dvh] flex-col items-center justify-center py-20"
          style={{ transform: "translateX(calc(var(--sidebar-width) / -2))" }}
        >
          <SectionHeader
            number={number}
            label={label}
            pill={pill}
            intro={intro}
          />
          
          <ScrollDownArrow targetId={`content-${id}`} isHeaderInView={isHeaderInView} />
        </div>
        
        {/* Conteúdo da seção */}
        <div 
          id={`content-${id}`} 
          className="section-content-offset relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center py-24"
          style={{ transform: "translateX(calc(var(--sidebar-width) / -2))" }}
        >
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  number,
  label,
  pill,
  intro,
}: {
  number: string;
  label: string;
  pill?: string;
  intro?: string;
}) {
  return (
    <Reveal>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: motionTimings.section, ease: motionEase }}
      >
        <div className="flex flex-col items-center text-center">
          <span
            className="mb-4 inline-block font-serif text-[15px] italic text-[var(--color-coffee)]"
            style={{ letterSpacing: "0.08em" }}
          >
            Capítulo {number}
          </span>

          <h2
            className="font-serif leading-[0.9]"
            style={{
              fontSize: "clamp(3rem, 10vw, 8.5rem)",
              color: "var(--color-espresso)", // Coffee for accents/details!
              letterSpacing: "-0.02em",
            }}
          >
            {label}
          </h2>

          {pill && (
            <span
              className="mt-6 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{
                color: "var(--color-coffee)",
                border: "1px solid rgba(92,51,32,0.2)",
              }}
            >
              {pill}
            </span>
          )}

          {intro && (
            <p
              className="mt-8 max-w-[640px] text-[17px] md:text-[20px] font-serif italic leading-relaxed text-[var(--color-forest)]"
            >
              {intro}
            </p>
          )}
        </div>

        {/* Elegant ornate divider line using coffee color */}
        <div className="mt-16 flex items-center justify-center opacity-80" style={{ width: "100%", minWidth: "300px" }}>
          <div className="h-px flex-1" style={{ minWidth: "80px", background: "linear-gradient(90deg, transparent, var(--color-coffee))" }} />
          <div className="mx-4 h-2 w-2 shrink-0 rotate-45 border border-[var(--color-coffee)]" />
          <div className="h-px flex-1" style={{ minWidth: "80px", background: "linear-gradient(270deg, transparent, var(--color-coffee))" }} />
        </div>
      </motion.div>
    </Reveal>
  );
}

function ScrollDownArrow({ targetId, isHeaderInView }: { targetId: string; isHeaderInView: boolean }) {
  const [clicked, setClicked] = useState(false);

  // Reseta o estado de clique quando o header sai da tela ou volta
  useEffect(() => {
    if (isHeaderInView) {
      setClicked(false);
    }
  }, [isHeaderInView]);

  // Se clicou, force a animação de saída. Se não clicou, dependa se o header está visível
  const state = clicked ? "clicked" : isHeaderInView ? "visible" : "hidden";

  return (
    <motion.div
      className="absolute bottom-12 left-1/2 -translate-x-1/2"
      initial="hidden"
      animate={state}
      variants={{
        hidden: { opacity: 0, y: -20, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 } 
        },
        clicked: { 
          opacity: 0, 
          y: 50, 
          scale: 0.95,
          transition: { duration: 0.5, ease: "easeIn" } 
        }
      }}
    >
      <motion.button
        type="button"
        aria-label="Ir para o conteúdo"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(92,51,32,0.2)] text-[var(--color-coffee)] transition-colors hover:bg-[rgba(92,51,32,0.06)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
        onClick={() => {
          setClicked(true);
          const el = document.getElementById(targetId);
          if (el) {
            window.scrollTo({
              top: el.getBoundingClientRect().top + window.scrollY,
              behavior: "smooth",
            });
          }
        }}
      >
        <ArrowDown size={22} strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
}
