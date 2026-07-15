"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { PressableMotion, Reveal, Stagger, StaggerItem } from "@/components/ui/MotionPrimitives";

/* ── Paleta completa: Verde + Café + Papel ── */
const PALETTE = [
  /* Verde botânico */
  { name: "Floresta",    hex: "#1E3028", token: "--color-forest",   role: "Base da marca",        group: "verde" },
  { name: "Serrinto",    hex: "#4C7A5D", token: "--color-green",    role: "Estados positivos",     group: "verde" },
  { name: "Névoa",       hex: "#B5C9BB", token: "--color-fern",     role: "Apoio suave",           group: "verde" },
  /* Café */
  { name: "Espresso",    hex: "#2C1810", token: "--color-espresso", role: "Profundidade quente",   group: "cafe" },
  { name: "Café",        hex: "#5C3320", token: "--color-coffee",   role: "Tom de terceiro pilar", group: "cafe" },
  { name: "Mocha",       hex: "#8B5E3C", token: "--color-mocha",    role: "Terracota suavizado",   group: "cafe" },
  { name: "Latte",       hex: "#C49A6C", token: "--color-latte",    role: "Bege dourado",          group: "cafe" },
  /* Papel + Ouro */
  { name: "Papel",       hex: "#FAF5EC", token: "--color-paper",    role: "Superfície principal",  group: "papel" },
  { name: "Creme",       hex: "#F2E8D6", token: "--color-cream",    role: "Camadas e respiro",     group: "papel" },
  { name: "Ouro",        hex: "#B5892A", token: "--color-gold",     role: "Acento editorial",      group: "papel" },
];

function TokenRow({
  name, hex, token, role,
}: { name: string; hex: string; token: string; role: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <PressableMotion>
      <button
        type="button"
        onClick={copy}
        className="anverso-focus group grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 rounded-none border-b border-[rgba(92,51,32,0.1)] py-3 text-left transition-all hover:bg-[rgba(92,51,32,0.03)] px-2"
        aria-label={`Copiar ${name}`}
      >
        <span
          className="h-8 w-8 rounded-full"
          style={{
            backgroundColor: hex,
            border: "1px solid rgba(47,44,45,0.14)",
          }}
        />
        <span className="min-w-0">
          <span
            className="block text-[12px] font-bold"
            style={{ color: "var(--color-espresso)" }}
          >
            {name}
          </span>
          <span
            className="block truncate text-[11px] md:text-[10px] font-serif italic"
            style={{ color: "var(--color-neutral)" }}
          >
            {role}
          </span>
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[11px] md:text-[9px]"
          style={{
            border: "1px solid rgba(92,51,32,0.2)",
            color: "var(--color-espresso)",
            background: "rgba(92,51,32,0.02)",
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copiado!" : hex}
        </span>
      </button>
    </PressableMotion>
  );
}

/* ── Círculos grandes de cor — visual impactante ── */
function ColorCircles() {
  const circles = [
    { hex: "#1E3028", sizeDesktop: 120, sizeMobile: 72, label: "Floresta" },
    { hex: "#5C3320", sizeDesktop: 90,  sizeMobile: 56, label: "Café" },
    { hex: "#B5892A", sizeDesktop: 70,  sizeMobile: 44, label: "Ouro" },
    { hex: "#FAF5EC", sizeDesktop: 52,  sizeMobile: 36, label: "Papel" },
    { hex: "#4C7A5D", sizeDesktop: 42,  sizeMobile: 30, label: "Verde" },
  ];

  return (
    <div className="flex items-center gap-4 md:gap-5">
      {circles.map((c) => (
        <div key={c.hex} className="flex flex-col items-center gap-2">
          <span
            className="block rounded-full"
            style={{
              width: `clamp(${c.sizeMobile}px, ${c.sizeDesktop / 14}vw, ${c.sizeDesktop}px)`,
              height: `clamp(${c.sizeMobile}px, ${c.sizeDesktop / 14}vw, ${c.sizeDesktop}px)`,
              background: c.hex,
              border: c.hex === "#FAF5EC"
                ? "1px solid rgba(181,162,130,0.50)"
                : "none",
              boxShadow: "0 8px 24px rgba(10,18,14,0.1)",
            }}
          />
          <span
            className="text-[11px] md:text-[9px] font-bold uppercase"
            style={{ letterSpacing: "0.14em", color: "var(--color-espresso)" }}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CoresSection() {
  const verde = PALETTE.filter((c) => c.group === "verde");
  const cafe  = PALETTE.filter((c) => c.group === "cafe");
  const papel = PALETTE.filter((c) => c.group === "papel");

  return (
    <SectionShell
      id="cores"
      label="Cores"
      pill="Paleta"
      intro="Três pilares: verde botânico como base, café como profundidade quente, papel e ouro como superfície e acento."
    >
      {/* ── Bloco central: manifesto visual + barras de cor ── */}
      <Reveal className="mb-12">
        <div
          className="overflow-hidden border-b border-[rgba(92,51,32,0.15)] pb-10 md:pb-16"
        >
          <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
            {/* Texto manifesto */}
            <div className="flex flex-col justify-between gap-8">
              <div>
                <p
                  className="font-serif italic leading-[1]"
                  style={{
                    fontSize: "clamp(2rem, 4.5vw, 3.6rem)",
                    color: "var(--color-espresso)",
                  }}
                >
                  <span style={{ color: "var(--color-forest)" }}>Botânico.</span>{" "}
                  <span style={{ color: "var(--color-coffee)" }}>Quente.</span>{" "}
                  <span style={{ color: "var(--color-gold)" }}>Editorial.</span>
                </p>
                <p
                  className="mt-6 max-w-[540px] text-[15px] leading-relaxed font-serif text-[var(--color-neutral)]"
                >
                  O verde carrega a natureza e a clareza da marca. O café traz
                  profundidade e acolhimento. O ouro sinaliza sem gritar. Juntos,
                  criam uma interface que lembra papel, folha e uma xícara na mesa.
                </p>
              </div>

              {/* Barra de cores horizontal */}
              <div>
                <div
                  className="grid h-12 overflow-hidden rounded-none"
                  style={{
                    gridTemplateColumns: `repeat(${PALETTE.length}, 1fr)`,
                  }}
                >
                  {PALETTE.map((c) => (
                    <span
                      key={c.token}
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} ${c.hex}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Círculos de cor */}
            <div className="hidden items-end lg:flex">
              <ColorCircles />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Tokens em três grupos ── */}
      <div className="grid gap-12 md:grid-cols-3">
        {/* Verde */}
        <div>
          <p
            className="mb-4 text-[11px] font-bold uppercase"
            style={{ letterSpacing: "0.20em", color: "var(--color-forest)" }}
          >
            Verde botânico
          </p>
          <Stagger className="flex flex-col">
            {verde.map((c) => (
              <StaggerItem key={c.token}>
                <TokenRow {...c} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Café */}
        <div>
          <p
            className="mb-4 text-[11px] font-bold uppercase"
            style={{ letterSpacing: "0.20em", color: "var(--color-coffee)" }}
          >
            Café
          </p>
          <Stagger className="flex flex-col">
            {cafe.map((c) => (
              <StaggerItem key={c.token}>
                <TokenRow {...c} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Papel + Ouro */}
        <div>
          <p
            className="mb-4 text-[11px] font-bold uppercase"
            style={{ letterSpacing: "0.20em", color: "var(--color-gold)" }}
          >
            Papel & Ouro
          </p>
          <Stagger className="flex flex-col">
            {papel.map((c) => (
              <StaggerItem key={c.token}>
                <TokenRow {...c} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* ── Combinações de contraste ── */}
      <Stagger className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Ação",
            bg: "#1E3028",
            fg: "#FAF5EC",
            accent: "#B5892A",
            text: "Preparar DOCX",
            sub: "Primário sobre floresta",
          },
          {
            title: "Acolhimento",
            bg: "#5C3320",
            fg: "#E8D5BE",
            accent: "#C49A6C",
            text: "Vamos por partes.",
            sub: "Café como fundo expressivo",
          },
          {
            title: "Leitura",
            bg: "#FAF5EC",
            fg: "#1E3028",
            accent: "#D9CCBA",
            text: "Impacto que floresce no tempo.",
            sub: "Corpo sobre papel",
          },
        ].map((combo) => (
          <StaggerItem key={combo.title}>
            <PressableMotion>
              <article
                className="p-6 transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: combo.bg,
                  color: combo.fg,
                  border: combo.bg === "#FAF5EC" ? "1px solid rgba(92,51,32,0.15)" : "none",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="mb-6 h-px w-12"
                  style={{ backgroundColor: combo.accent }}
                />
                <p
                  className="text-[11px] md:text-[10px] font-bold uppercase"
                  style={{ letterSpacing: "0.14em", opacity: 0.7 }}
                >
                  {combo.title}
                </p>
                <p className="mt-3 font-serif text-[22px] italic leading-tight">
                  {combo.text}
                </p>
                <p className="mt-4 font-serif text-[12px] italic" style={{ opacity: 0.7 }}>
                  {combo.sub}
                </p>
              </article>
            </PressableMotion>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}
