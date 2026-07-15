import Image from "next/image";
import { SectionShell } from "@/components/ui/SectionShell";
import { PressableMotion, Reveal, Stagger, StaggerItem } from "@/components/ui/MotionPrimitives";

const ESSENCIA = [
  { word: "Calma",      sub: "Sem pressa, sem ruído" },
  { word: "Clareza",    sub: "Cada passo, visível" },
  { word: "Confiança",  sub: "Você entrega, nós cuidamos" },
];

const PILARES = [
  {
    label: "Propósito",
    text:  "Tirar o peso da formatação acadêmica e devolver foco para o texto.",
  },
  {
    label: "Visão",
    text:  "Ser o jeito tranquilo de preparar trabalhos com qualidade e critério.",
  },
  {
    label: "Valores",
    text:  "Clareza, cuidado, confiança e a sensação constante de progresso.",
  },
  {
    label: "Personalidade",
    text:  "Calma, precisa e humana. Guia sem parecer burocrática.",
  },
];

export function MarcaSection() {
  return (
    <SectionShell
      id="marca"
      label="Marca"
      pill="Identidade"
      intro="Nome, símbolo, valores e personalidade: os blocos que compõem a presença visual do Anverso."
    >
      {/* ── Hero: logo centralizado com atmosfera editorial ── */}
      <Reveal>
        <div
          className="relative px-6 py-20 flex flex-col items-center text-center"
          style={{
            borderBottom: "1px solid rgba(92,51,32,0.15)",
          }}
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            <Image
              src="/icons/Anverso-logo.png"
              alt="Anverso"
              width={500}
              height={150}
              className="object-contain"
              style={{ width: "min(75vw, 420px)", height: "auto" }}
              loading="eager"
              unoptimized
            />

            <p
              className="mt-8 max-w-[520px] font-serif text-[24px] italic leading-snug"
              style={{ color: "var(--color-espresso)" }}
            >
              Seu trabalho em ordem, sem complicação.
            </p>

            {/* Três valores como trio limpo */}
            <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16">
              {ESSENCIA.map((item) => (
                <div key={item.word} className="flex flex-col items-center gap-2">
                  <span
                    className="font-serif text-[12px] font-bold uppercase"
                    style={{ letterSpacing: "0.22em", color: "var(--color-espresso)" }}
                  >
                    {item.word}
                  </span>
                  <span
                    className="text-[12px] font-serif italic"
                    style={{ color: "var(--color-neutral)" }}
                  >
                    {item.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Grade assimétrica: pilares + assets ── */}
      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_320px]">
        {/* Pilares — texto denso à esquerda */}
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {PILARES.map(({ label, text }) => (
            <StaggerItem key={label}>
              <PressableMotion className="h-full">
                <div
                  className="flex h-full flex-col gap-4 p-6 transition-colors hover:bg-[rgba(92,51,32,0.02)]"
                  style={{
                    borderLeft: "1px solid rgba(92,51,32,0.15)",
                  }}
                >
                  <span
                    className="font-serif text-[20px] font-bold"
                    style={{ color: "var(--color-espresso)" }}
                  >
                    {label}
                  </span>
                  <p
                    className="text-[14px] leading-relaxed font-serif"
                    style={{ color: "var(--color-neutral)" }}
                  >
                    {text}
                  </p>
                </div>
              </PressableMotion>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Assets de marca — coluna vertical à direita */}
        <Stagger className="flex flex-col gap-6">
          {/* Logo */}
          <StaggerItem>
            <PressableMotion>
              <div
                className="flex flex-col items-center gap-6 p-8"
                style={{
                  border: "1px solid rgba(92,51,32,0.15)",
                  background: "transparent",
                }}
              >
                <Image
                  src="/icons/Anverso-logo.png"
                  alt="Anverso"
                  width={150}
                  height={60}
                  className="object-contain"
                  unoptimized
                />
                <p
                  className="text-[11px] md:text-[10px] font-bold uppercase border-t border-[rgba(92,51,32,0.1)] w-full text-center pt-4"
                  style={{ letterSpacing: "0.16em", color: "var(--color-espresso)" }}
                >
                  Logotipo principal
                </p>
              </div>
            </PressableMotion>
          </StaggerItem>

          {/* Símbolo + ramo */}
          <StaggerItem>
            <div className="grid grid-cols-2 gap-4">
              <PressableMotion>
                <div
                  className="flex flex-col items-center gap-4 p-6"
                  style={{
                    border: "1px solid rgba(92,51,32,0.15)",
                  }}
                >
                  <Image
                    src="/icons/xicara.png"
                    alt=""
                    width={44}
                    height={44}
                    className="object-contain"
                    unoptimized
                  />
                  <p
                    className="text-center text-[11px] md:text-[9px] font-bold uppercase"
                    style={{ letterSpacing: "0.14em", color: "var(--color-espresso)" }}
                  >
                    Símbolo
                  </p>
                </div>
              </PressableMotion>
              <PressableMotion>
                <div
                  className="flex flex-col items-center gap-4 p-6"
                  style={{
                    border: "1px solid rgba(92,51,32,0.15)",
                  }}
                >
                  <Image
                    src="/icons/leaves.png"
                    alt=""
                    width={44}
                    height={44}
                    className="object-contain opacity-80"
                    unoptimized
                  />
                  <p
                    className="text-center text-[11px] md:text-[9px] font-bold uppercase"
                    style={{ letterSpacing: "0.14em", color: "var(--color-espresso)" }}
                  >
                    Ramo
                  </p>
                </div>
              </PressableMotion>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </SectionShell>
  );
}
