"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Lightbulb, MessageCircle, ShieldCheck } from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import {
  PressableMotion,
  Reveal,
  Stagger,
  StaggerItem,
  motionEase,
  motionTimings,
} from "@/components/ui/MotionPrimitives";

const PRINCIPLES = [
  {
    title: "Clareza",
    text:  "Fale de forma simples, direta e sem jargão técnico.",
    Icon:  MessageCircle,
    color: "var(--color-forest)",
  },
  {
    title: "Empatia",
    text:  "Oriente a pessoa sem culpa, pressa ou tom de erro.",
    Icon:  HeartHandshake,
    color: "var(--color-mocha)",
  },
  {
    title: "Credibilidade",
    text:  "Comunique com segurança, critério e transparência.",
    Icon:  ShieldCheck,
    color: "var(--color-espresso)",
  },
  {
    title: "Inspirar ação",
    text:  "Sempre indique o próximo passo possível.",
    Icon:  Lightbulb,
    color: "var(--color-gold-strong)",
  },
];

const EXAMPLES = [
  {
    situation: "Erro de envio",
    use:   "Falhou de novo? Vamos tentar reenviar agora.",
    avoid: "Falha no upload. Erro 500.",
  },
  {
    situation: "Confirmação",
    use:   "Tudo funcionando. Seu progresso está salvo.",
    avoid: "Operação concluída com sucesso.",
  },
  {
    situation: "Atenção",
    use:   "Falta informar a cidade para montarmos a capa.",
    avoid: "Campo obrigatório não preenchido.",
  },
  {
    situation: "Geração",
    use:   "Respira. Seu DOCX está pronto para baixar.",
    avoid: "Arquivo gerado.",
  },
];

const PHRASES = [
  "\"Vamos por partes.\"",
  "\"Falta só mais um detalhe para preparar seu DOCX.\"",
  "\"Respira. A gente organiza isso com você.\"",
  "\"Seu trabalho está quase pronto.\"",
];

export function VozSection() {
  const [activePhrase, setActivePhrase] = useState(0);

  return (
    <SectionShell
      id="voz"
      label="Tom de Voz"
      pill="Redação"
      intro="O texto do Anverso reduz ansiedade, mostra critério e transforma pendências em passos claros."
    >
      {/* ── Layout de três colunas ── */}
      <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)]">

        {/* Coluna 1: Manifesto interativo */}
        <Reveal>
          <div
            className="flex h-full flex-col p-8"
            style={{
              background: "rgba(92,51,32,0.02)",
              border: "1px solid rgba(92,51,32,0.15)",
            }}
          >
            <p
              className="text-[11px] md:text-[10px] font-bold uppercase"
              style={{ letterSpacing: "0.22em", color: "var(--color-espresso)" }}
            >
              Manifesto de voz
            </p>

            {/* Frase animada */}
            <div className="relative mt-12 min-h-[100px] xl:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={activePhrase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionTimings.item, ease: motionEase }}
                >
                  <p
                    className="font-serif italic leading-tight"
                    style={{
                      fontSize: "clamp(1.5rem, 2.5vw, 1.8rem)",
                      color: "var(--color-espresso)",
                    }}
                  >
                    {PHRASES[activePhrase]}
                  </p>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Seletores de frase */}
            <div className="mt-auto space-y-3 pt-8 border-t border-[rgba(92,51,32,0.1)]">
              {PHRASES.map((phrase, index) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setActivePhrase(index)}
                  className="anverso-focus w-full text-left text-[12px] font-serif transition-colors px-2 py-1.5"
                  style={
                    activePhrase === index
                      ? {
                          color: "var(--color-espresso)",
                          borderLeft: "2px solid var(--color-espresso)",
                          fontWeight: 600,
                          fontStyle: "italic",
                        }
                      : {
                          color: "var(--color-neutral)",
                          borderLeft: "2px solid transparent",
                        }
                  }
                >
                  {phrase.replace(/['"]+/g, '')}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Coluna 2: Princípios */}
        <div>
          <p
            className="mb-6 text-[11px] md:text-[10px] font-bold uppercase border-b border-[rgba(92,51,32,0.1)] pb-2"
            style={{ letterSpacing: "0.18em", color: "var(--color-espresso)" }}
          >
            Princípios
          </p>
          <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            {PRINCIPLES.map(({ title, text, Icon, color }) => (
              <StaggerItem key={title}>
                <PressableMotion>
                  <div className="flex items-start gap-5">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "transparent",
                        border: `1px solid rgba(92,51,32,0.2)`,
                        color: color,
                      }}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <div>
                      <p
                        className="text-[14px] font-serif font-bold"
                        style={{ color: "var(--color-espresso)" }}
                      >
                        {title}
                      </p>
                      <p
                        className="mt-1.5 text-[12px] leading-relaxed"
                        style={{ color: "var(--color-neutral)" }}
                      >
                        {text}
                      </p>
                    </div>
                  </div>
                </PressableMotion>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Coluna 3: Tabela de exemplos */}
        <div>
          <p
            className="mb-6 text-[11px] md:text-[10px] font-bold uppercase border-b border-[rgba(92,51,32,0.1)] pb-2"
            style={{ letterSpacing: "0.18em", color: "var(--color-espresso)" }}
          >
            Exemplos Práticos
          </p>
          <Reveal>
            <div className="flex flex-col gap-6">
              {EXAMPLES.map((ex) => (
                <PressableMotion key={ex.situation}>
                  <div className="group">
                    <p
                      className="text-[11px] font-bold uppercase tracking-widest mb-3"
                      style={{ color: "var(--color-gold-strong)" }}
                    >
                      {ex.situation}
                    </p>
                    <div className="space-y-3 pl-4 border-l border-[rgba(92,51,32,0.15)]">
                      {/* Use */}
                      <div>
                        <p
                          className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: "var(--color-green)" }}
                        >
                          Use
                        </p>
                        <p
                          className="text-[13px] font-serif italic"
                          style={{ color: "var(--color-espresso)" }}
                        >
                          "{ex.use}"
                        </p>
                      </div>
                      {/* Evite */}
                      <div>
                        <p
                          className="text-[11px] md:text-[10px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: "var(--color-neutral)", opacity: 0.8 }}
                        >
                          Evite
                        </p>
                        <p
                          className="text-[13px] font-serif italic"
                          style={{ color: "var(--color-neutral)", opacity: 0.8 }}
                        >
                          "{ex.avoid}"
                        </p>
                      </div>
                    </div>
                  </div>
                </PressableMotion>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
