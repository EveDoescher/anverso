"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Home, MessageCircle, Palette, Shapes, Star, Type } from "lucide-react";

const NAV_ITEMS = [
  { id: "marca",       label: "Marca",       Icon: Home },
  { id: "voz",         label: "Tom de Voz",  Icon: MessageCircle },
  { id: "cores",       label: "Cores",       Icon: Palette },
  { id: "tipografia",  label: "Tipografia",  Icon: Type },
  { id: "componentes", label: "Componentes", Icon: Shapes },
  { id: "icones",      label: "Ícones",      Icon: Star },
];

export function Sidebar() {
  const [active, setActive] = useState("marca");
  const reduceMotion = useReducedMotion();

  const activeIndex = useMemo(() => {
    const index = NAV_ITEMS.findIndex((item) => item.id === active);
    return index >= 0 ? index : 0;
  }, [active]);

  useEffect(() => {
    let ticking = false;

    function updateActiveSection() {
      ticking = false;
      const marker = window.innerHeight * 0.36;
      let currentId = NAV_ITEMS[0].id;

      for (const item of NAV_ITEMS) {
        const section = document.getElementById(item.id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom >= marker) {
          setActive(item.id);
          return;
        }
        if (rect.top <= marker) currentId = item.id;
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      setActive(isAtBottom ? NAV_ITEMS[NAV_ITEMS.length - 1].id : currentId);
    }

    function handleScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveSection);
      }
    }

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  function scrollTo(id: string) {
    const section = document.getElementById(id);
    if (!section) return;
    setActive(id);
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <>
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, x: -20, y: "-50%" }}
      animate={{ opacity: 1, x: 0, y: "-50%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed left-5 top-1/2 z-50 hidden md:flex flex-col"
      aria-label="Navegação do guia (Desktop)"
    >
      <nav
        className="relative flex flex-col items-center gap-2 rounded-[999px] p-3"
        style={{
          border: "1px solid rgba(181,162,130,0.42)",
          background: "rgba(250,245,236,0.82)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(20,32,26,0.12), inset 0 1px 0 rgba(255,255,255,0.60)",
        }}
      >
        {/* Anel interno decorativo */}
        <span
          className="pointer-events-none absolute inset-[3px] rounded-[999px]"
          style={{ border: "1px solid rgba(255,255,255,0.45)" }}
        />

        {NAV_ITEMS.map((item, index) => {
          const isActive = item.id === active;
          const isPast = index < activeIndex;
          const Icon = item.Icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              whileHover={reduceMotion ? undefined : { scale: 1.08, x: 2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.93 }}
              className={[
                "anverso-focus relative z-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full transition-colors duration-200",
                isActive
                  ? "text-white"
                  : "text-[var(--color-forest)] hover:text-[var(--color-gold-strong)]",
              ].join(" ")}
            >
              {isActive ? (
                <motion.span
                  layoutId="sidebar-active-orb"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--color-forest)",
                    boxShadow: "0 8px 20px rgba(20,32,26,0.30)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}

              <Icon size={24} strokeWidth={1.75} className="relative z-10" />

              {isPast && !isActive ? (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-gold)" }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </nav>

    </motion.aside>

    {/* Bottom Nav Mobile (Floating Pill) */}
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center md:hidden pointer-events-none">
      <motion.nav
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="pointer-events-auto relative flex items-center justify-center gap-1 rounded-[999px] p-2"
        style={{
          border: "1px solid rgba(181,162,130,0.42)",
          background: "rgba(250,245,236,0.82)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 60px rgba(20,32,26,0.12), inset 0 1px 0 rgba(255,255,255,0.60)",
        }}
        aria-label="Navegação do guia (Mobile)"
      >
        <span
          className="pointer-events-none absolute inset-[3px] rounded-[999px]"
          style={{ border: "1px solid rgba(255,255,255,0.45)" }}
        />
        {NAV_ITEMS.map((item, index) => {
          const isActive = item.id === active;
          const isPast = index < activeIndex;
          const Icon = item.Icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={[
                "anverso-focus relative z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors duration-200",
                isActive
                  ? "text-white"
                  : "text-[var(--color-forest)] hover:text-[var(--color-gold-strong)]",
              ].join(" ")}
            >
              {isActive ? (
                <motion.span
                  layoutId="mobile-nav-active-orb"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--color-forest)",
                    boxShadow: "0 8px 20px rgba(20,32,26,0.30)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}

              <Icon size={20} strokeWidth={1.75} className="relative z-10" />

              {isPast && !isActive ? (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-gold)" }}
                />
              ) : null}
            </button>
          );
        })}
      </motion.nav>
    </div>
    </>
  );
}
