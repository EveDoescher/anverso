"use client";

import { useState } from "react";
import { Columns3, TextCursorInput } from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { PressableMotion, Reveal, Stagger, StaggerItem } from "@/components/ui/MotionPrimitives";

const SCALE = [
  {
    name: "H1",
    size: "44px",
    sample: "Título principal",
    use: "Abertura e marcos",
    tone: "Editorial",
    isSerif: true,
  },
  {
    name: "H2",
    size: "30px",
    sample: "Título secundário",
    use: "Seções do guia",
    tone: "Orientação",
    isSerif: true,
  },
  {
    name: "H3",
    size: "21px",
    sample: "Título terciário",
    use: "Módulos e grupos",
    tone: "Interface",
    isSerif: true,
  },
  {
    name: "Body",
    size: "15px",
    sample: "Texto de parágrafo com leitura confortável e espaço generoso.",
    use: "Interface",
    tone: "Leitura",
    isSerif: false,
  },
  {
    name: "Caption",
    size: "12px",
    sample: "Texto auxiliar e metadados",
    use: "Metadados",
    tone: "Apoio",
    isSerif: false,
  },
];

export function TipografiaSection() {
  const [dense, setDense] = useState(false);

  return (
    <SectionShell
      id="tipografia"
      label="Tipografia"
      pill="Escala"
      intro="A serifada carrega a memória editorial da marca. A sans segura os formulários, estados e leitura funcional."
    >
      <div className="grid gap-8 xl:grid-cols-[1fr_1.3fr_1fr] xl:items-stretch xl:gap-12">
        {/* ── Escala tipográfica ── */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(92,51,32,0.15)] pb-3">
            <p
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.18em", color: "var(--color-espresso)" }}
            >
              Hierarquia aplicada
            </p>
            <button
              type="button"
              onClick={() => setDense((v) => !v)}
              className="anverso-focus inline-flex items-center gap-2 text-[11px] md:text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: "var(--color-coffee)" }}
            >
              <Columns3 size={13} />
              {dense ? "Modo aberto" : "Modo denso"}
            </button>
          </div>

          <Stagger className={`transition-all duration-300 ease-out ${dense ? "space-y-4" : "space-y-6"}`}>
            {SCALE.map((item) => (
              <StaggerItem key={item.name}>
                <PressableMotion>
                  <div
                    className="group border-l border-[rgba(92,51,32,0.15)] pl-5 py-2 transition-colors hover:border-[rgba(92,51,32,0.4)]"
                  >
                    <div className="grid gap-3 md:grid-cols-[60px_1fr_100px] md:items-baseline">
                      <p
                        className="text-[12px] font-black"
                        style={{ color: "var(--color-espresso)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="min-w-0 break-words transition-all duration-300 ease-out"
                        style={{
                          fontFamily: item.isSerif
                            ? "var(--font-serif)"
                            : "var(--font-sans)",
                          fontSize: dense ? "15px" : item.size,
                          fontWeight: item.isSerif ? 700 : 400,
                          lineHeight: item.name === "Body" ? 1.5 : 1.08,
                          color: "var(--color-text)",
                        }}
                      >
                        {item.sample}
                      </p>
                      <div className="text-left md:text-right">
                        <p
                          className="text-[11px] md:text-[10px] font-bold uppercase"
                          style={{ color: "var(--color-espresso)" }}
                        >
                          {item.tone}
                        </p>
                        <p
                          className="text-[11px] font-serif italic mt-0.5"
                          style={{ color: "var(--color-neutral)" }}
                        >
                          {item.use}
                        </p>
                      </div>
                    </div>
                  </div>
                </PressableMotion>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* ── Painel de contexto ── */}
        <Reveal
          delay={0.08}
          className="relative flex flex-col justify-center p-6 border-l border-[rgba(92,51,32,0.15)]"
        >
          <TextCursorInput size={24} style={{ color: "var(--color-espresso)", strokeWidth: 1.5 }} />
          <p
            className="mt-8 font-serif italic leading-[1.1]"
            style={{
              fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
              color: "var(--color-espresso)",
            }}
          >
            Impacto que floresce no tempo.
          </p>
          <p
            className="mt-6 text-[14px] leading-relaxed font-serif"
            style={{ color: "var(--color-neutral)" }}
          >
            A tipografia deve abrir espaço para respirar, mas também deixar o
            produto objetivo quando o usuário estiver preenchendo, revisando ou
            baixando documentos.
          </p>

          {/* Mini amostra de par */}
          <div
            className="mt-10 p-6"
            style={{ border: "1px solid rgba(92,51,32,0.15)" }}
          >
            <p
              className="font-serif text-[20px] font-bold"
              style={{ color: "var(--color-espresso)" }}
            >
              Seu trabalho em ordem.
            </p>
            <p
              className="text-[13px] leading-relaxed mt-2 font-serif italic"
              style={{ color: "var(--color-neutral)" }}
            >
              Preencha com calma: nós estruturamos para você.
            </p>
          </div>
        </Reveal>

        {/* ── Painel de identidade tipográfica (Cartão Verde Floresta) ── */}
        <Reveal
          className="relative min-h-[280px] xl:min-h-[400px] overflow-hidden p-8 xl:order-first"
          style={{
            background: "var(--color-forest)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
          }}
        >
          {/* Aa decorativo de fundo */}
          <div
            className="pointer-events-none absolute -bottom-10 -right-6 select-none font-serif font-black leading-none"
            style={{
              fontSize: "180px",
              color: "rgba(255,255,255,0.035)",
            }}
          >
            Aa
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between gap-12">
            <div>
              <p
                className="text-[11px] md:text-[10px] font-bold uppercase"
                style={{ letterSpacing: "0.24em", color: "var(--color-gold)" }}
              >
                Sistema editorial
              </p>
              <p
                className="mt-8 font-serif italic leading-[0.80]"
                style={{
                  fontSize: "clamp(4rem, 8vw, 6rem)",
                  color: "var(--color-ink-inv)",
                }}
              >
                Aa
              </p>
              <p
                className="mt-6 max-w-[300px] text-[13px] leading-relaxed font-serif"
                style={{ color: "var(--color-muted-inv)" }}
              >
                A marca fala como uma página bem composta: quente, precisa e
                com ritmo suficiente para guiar sem endurecer.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Crimson Pro", "Títulos, assinatura e memória editorial"],
                ["Mulish", "Campos, botões, tabelas e leitura de interface"],
              ].map(([name, use]) => (
                <PressableMotion key={name}>
                  <div
                    className="p-4"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: "var(--color-ink-inv)" }}
                    >
                      {name}
                    </p>
                    <p
                      className="mt-1 text-[11px] leading-relaxed font-serif italic"
                      style={{ color: "var(--color-muted-inv)" }}
                    >
                      {use}
                    </p>
                  </div>
                </PressableMotion>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
