"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import leaves1 from "@/docs/design/icons/leaves.png";
import leaves2 from "@/docs/design/icons/leaves-2.png";
import leaves3 from "@/docs/design/icons/leaves-3.png";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Maximize,
  Minimize,
  Minus,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Toggle } from "@/components/ui/Toggle";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export interface Page {
  id: number;
  label: string;
  type: "cover" | "title-page" | "abstract" | "summary" | "content" | "references";
  title: string;
}

type DocumentPreviewProps = {
  pages: Page[];
  currentPage: number;
  showGuides: boolean;
  onPageChange: (page: number) => void;
  onToggleGuides: () => void;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DocumentPreview({
  pages,
  currentPage,
  showGuides,
  onPageChange,
  onToggleGuides,
  className = "",
}: DocumentPreviewProps) {
  const page = pages[currentPage];
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function previousPage() {
    onPageChange(clamp(currentPage - 1, 0, pages.length - 1));
  }

  function nextPage() {
    onPageChange(clamp(currentPage + 1, 0, pages.length - 1));
  }

  return (
    <div
      className={[
        "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-cream-soft)] p-4",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-serif text-[22px] font-bold leading-tight text-[var(--color-forest)]">
            Prévia do documento
          </p>

          <p className="mt-1 text-[11px] text-[var(--color-neutral)]">
            Visualização aproximada antes da geração do arquivo final.
          </p>
        </div>

        <Badge tone="success">Perfil acadêmico</Badge>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={4}
        centerOnInit={true}
        centerZoomedOut={true}
        wheel={{ step: 0.01 }}
        pinch={{ step: 5 }}
        onTransform={(ref) => setZoom(Math.round(ref.state.scale * 100))}
        onInit={(ref) => setZoom(Math.round(ref.state.scale * 100))}
      >
        {({ zoomIn, zoomOut, state }) => (
          <>
            {!isFullscreen && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-2 sm:px-3 sm:py-2">
              <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="primary"
                    icon={ChevronLeft}
                    label="Página anterior"
                    onClick={previousPage}
                    disabled={currentPage === 0}
                  />

                  <span className="min-w-[60px] sm:min-w-[82px] text-center text-[11px] font-bold text-[var(--color-text)]">
                    <span className="hidden sm:inline">Página </span>
                    {currentPage + 1}/{pages.length}
                  </span>

                  <IconButton
                    variant="primary"
                    icon={ChevronRight}
                    label="Próxima página"
                    onClick={nextPage}
                    disabled={currentPage === pages.length - 1}
                  />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <IconButton
                    variant="primary"
                    icon={Minus}
                    label="Diminuir zoom"
                    onClick={() => zoomOut(0.2)}
                  />

                  <span className="min-w-[42px] text-center text-[11px] font-bold text-[var(--color-neutral)]">
                    {zoom}%
                  </span>

                  <IconButton
                    variant="primary"
                    icon={Plus}
                    label="Aumentar zoom"
                    onClick={() => zoomIn(0.2)}
                  />
                </div>
              </div>
            </div>
            )}

            <div className={!isFullscreen ? "mt-4 flex flex-col lg:grid lg:grid-cols-[1fr_260px] gap-4 w-full min-w-0" : ""}>
              {(() => {
                const content = (
                  <div
                    ref={containerRef}
                    className={
                      isFullscreen
                        ? "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#eae3d9] backdrop-blur-md"
                        : "relative flex w-full min-w-0 h-[400px] md:h-[580px] items-center justify-center overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[rgba(217,204,186,0.25)]"
                    }
                    style={{ cursor: "grab" }}
                    onMouseDown={(e) => (e.currentTarget.style.cursor = "grabbing")}
                    onMouseUp={(e) => (e.currentTarget.style.cursor = "grab")}
                    onMouseLeave={(e) => (e.currentTarget.style.cursor = "grab")}
                  >
                    {isFullscreen && (
                      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <Image src={leaves1} alt="" className="absolute -left-10 -top-10 md:-left-20 md:-top-20 w-[200px] md:w-[600px] opacity-10 transform -rotate-12" />
                        <Image src={leaves2} alt="" className="absolute -right-5 md:-right-10 top-1/4 w-[150px] md:w-[450px] opacity-10 transform rotate-45" />
                        <Image src={leaves3} alt="" className="absolute -bottom-10 -left-5 md:-bottom-20 md:-left-10 w-[180px] md:w-[500px] opacity-10 transform rotate-12" />
                        <Image src={leaves1} alt="" className="hidden md:block absolute -right-20 -bottom-20 w-[600px] opacity-10 transform rotate-180" />
                      </div>
                    )}
                {!isFullscreen && (
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/80 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95"
                    title="Tela cheia"
                  >
                    <Maximize size={16} className="text-[var(--color-forest)]" />
                  </button>
                )}

                {isFullscreen && (
                  <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-2 shadow-2xl">
                    <IconButton
                      variant="primary"
                      icon={ChevronLeft}
                      label="Página anterior"
                      onClick={previousPage}
                      disabled={currentPage === 0}
                    />
                    <span className="min-w-[60px] text-center text-[11px] font-bold text-[var(--color-text)]">
                      {currentPage + 1}/{pages.length}
                    </span>
                    <IconButton
                      variant="primary"
                      icon={ChevronRight}
                      label="Próxima página"
                      onClick={nextPage}
                      disabled={currentPage === pages.length - 1}
                    />
                    <div className="mx-1 h-5 w-[1px] bg-[var(--color-border)]" />
                    <IconButton
                      variant="primary"
                      icon={showGuides ? Eye : EyeOff}
                      label={showGuides ? "Ocultar margens" : "Exibir margens"}
                      onClick={onToggleGuides}
                    />
                    <IconButton
                      variant="primary"
                      icon={Minimize}
                      label="Sair da tela cheia"
                      onClick={() => setIsFullscreen(false)}
                    />
                  </div>
                )}

                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <article
                    className={[
                      "relative w-[350px] aspect-[210/297] origin-center overflow-hidden bg-[var(--color-paper)] shadow-[0_18px_42px_rgba(47,44,45,0.16)]",
                      showGuides
                        ? "outline outline-1 outline-[rgba(63,91,74,0.22)]"
                        : "",
                    ].join(" ")}
                  >
                    {showGuides ? (
                      <div
                        className="pointer-events-none absolute border border-dashed border-[rgba(63,91,74,0.4)]"
                        style={{ 
                          top: 'calc(50px - 1px)',
                          right: 'calc(33px - 1px)',
                          bottom: 'calc(33px - 1px)',
                          left: 'calc(50px - 1px)' 
                        }}
                      />
                    ) : null}

                    <div
                      className="flex h-full flex-col text-center text-[7px] leading-[1.5] text-black"
                      style={{
                        paddingTop: 50,
                        paddingRight: 33,
                        paddingBottom: 33,
                        paddingLeft: 50,
                      }}
                    >
                      {page.type === "cover" ? (
                        <>
                          <p className="font-bold uppercase">INSTITUIÇÃO DE ENSINO</p>
                          <p className="mt-7 uppercase">NOME DO AUTOR</p>

                          <div className="mt-16">
                            <p className="font-bold uppercase leading-snug">
                              {page.title}
                            </p>
                          </div>

                          <div className="mt-auto">
                            <p>CIDADE</p>
                            <p>ANO</p>
                          </div>
                        </>
                      ) : null}

                      {page.type === "title-page" ? (
                        <>
                          <p className="mt-7 uppercase">NOME DO AUTOR</p>

                          <div className="mt-16">
                            <p className="font-bold uppercase leading-snug">
                              {page.title}
                            </p>

                            <div className="mt-[11px] flex justify-end">
                              <p className="w-[55%] text-justify text-[6px] leading-[1.2]">
                                Natureza do trabalho (Ex: TCC, Dissertação), objetivo pretendido, nome da instituição e área de concentração.
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <p>CIDADE</p>
                            <p>ANO</p>
                          </div>
                        </>
                      ) : null}

                      {page.type === "abstract" ? (
                        <>
                          <p className="font-bold uppercase">RESUMO</p>
                          <div className="mt-[11px] text-justify">
                            <p>
                              Este espaço é dedicado ao resumo na língua vernácula. Segundo a ABNT, o resumo deve ser digitado em parágrafo único, sem recuo de primeira linha, utilizando espaçamento simples e tamanho de fonte padrão. Deve apresentar de forma concisa os objetivos, a metodologia, os resultados e as conclusões do trabalho, contendo entre 150 e 500 palavras, servindo como elemento crucial para indexação.
                            </p>
                            <p className="mt-[11px] font-bold">
                              Palavras-chave: <span className="font-normal">Formatação. ABNT. Trabalhos Acadêmicos.</span>
                            </p>
                          </div>
                        </>
                      ) : null}

                      {page.type === "summary" ? (
                        <>
                          <p className="font-bold uppercase">
                            SUMÁRIO
                          </p>

                          <div className="mt-[11px] text-left">
                            {[
                              { label: "1 INTRODUÇÃO", page: "1", style: "font-bold uppercase" },
                              { label: "1.1 CONTEXTUALIZAÇÃO DO TEMA", page: "1", style: "uppercase" },
                              { label: "2 DESENVOLVIMENTO", page: "3", style: "font-bold uppercase" },
                              { label: "2.1 FUNDAMENTAÇÃO TEÓRICA", page: "3", style: "uppercase" },
                              { label: "2.1.1 Metodologia de pesquisa", page: "4", style: "font-bold" },
                              { label: "3 CONSIDERAÇÕES FINAIS", page: "9", style: "font-bold uppercase" },
                              { label: "REFERÊNCIAS", page: "10", style: "font-bold uppercase" },
                            ].map(({ label, page, style }) => (
                              <div key={label} className="flex items-baseline gap-1">
                                <span className={`${style} shrink-0`}>{label}</span>
                                <span className="flex-1 overflow-hidden whitespace-nowrap text-clip text-black/50 select-none">
                                  {".".repeat(150)}
                                </span>
                                <span className="shrink-0">{page}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}

                      {page.type === "content" ? (
                        <>
                          <p className="text-left font-bold uppercase">
                            {page.title}
                          </p>

                          <div className="mt-[11px] text-justify indent-[21px]">
                            <p>
                              Este espaço representa um trecho de conteúdo acadêmico 
                              utilizado exclusivamente para demonstrar a organização visual 
                              da página. A estruturação correta do texto é fundamental 
                              para garantir a legibilidade e a padronização exigidas 
                              pelas instituições de ensino superior no Brasil. Desta forma, 
                              cada elemento visual foi cuidadosamente planejado para refletir 
                              com precisão as margens e os recuos estabelecidos.
                            </p>
                            <p>
                              As formatações de espaçamentos, tipografia e alinhamentos 
                              são aplicadas de maneira rigorosa, seguindo as diretrizes 
                              oficiais da Associação Brasileira de Normas Técnicas (ABNT). 
                              O alinhamento justificado garante que as margens esquerda e 
                              direita permaneçam uniformes, enquanto o espaçamento entrelinhas 
                              de 1,5 proporciona um respiro visual essencial para leituras 
                              acadêmicas extensas e avaliações de bancas examinadoras.
                            </p>
                            <p>
                              Além disso, a régua virtual e as guias de margem permitem 
                              ao usuário ter uma percepção exata de como a mancha gráfica 
                              será distribuída no papel em formato A4. Essa prévia interativa 
                              elimina a necessidade de exportações repetitivas, assegurando 
                              que o resultado final esteja impecável e perfeitamente alinhado 
                              aos padrões científicos antes mesmo da geração do arquivo final.
                            </p>
                          </div>
                        </>
                      ) : null}

                      {page.type === "references" ? (
                        <>
                          <p className="font-bold uppercase">REFERÊNCIAS</p>
                          
                          <div className="mt-[11px] flex flex-col gap-[11px] text-left leading-[1.2]">
                            <p>
                              SOBRENOME 1, Nome 1. <strong>Título de Exemplo Um</strong>: subtítulo de exemplo. Edição. Cidade Fictícia: Editora Fictícia, 202X.
                            </p>
                            <p>
                              SOBRENOME 2, Nome 2. <strong>Título de Exemplo Dois</strong>. 2. ed. Cidade Genérica: Editora Genérica, 202X.
                            </p>
                            <p>
                              SOBRENOME 3, Nome 3. Exemplo de artigo. <strong>Revista de Exemplo</strong>, Cidade, v. X, n. Y, p. 10-20, 202X.
                            </p>
                          </div>
                        </>
                      ) : null}

                      {/* ABNT Pagination: Capa is not counted. Folha de rosto is page 1 (hidden). Visible from Introdução (id 5, page 4) */}
                      {page.id >= 5 && (
                        <p
                          className="absolute text-[7px] leading-none"
                          style={{ top: 'calc(33px - 1px)', right: 'calc(33px - 1px)' }}
                        >
                          {page.id - 1}
                        </p>
                      )}
                    </div>
                  </article>
                </TransformComponent>
              </div>
                );

                if (mounted && isFullscreen) {
                  return createPortal(content, document.body);
                }
                
                return content;
              })()}

              {!isFullscreen && (
                <aside className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-3">
                <div className="hidden lg:flex items-center gap-2">
                  <Eye size={15} className="text-[var(--color-green)]" />

                  <p className="text-[12px] font-bold text-[var(--color-text)]">
                    Estrutura
                  </p>
                </div>

                <div className="hidden lg:block mt-3 space-y-1.5">
                  {pages.map((item, index) => {
                    const isActive = index === currentPage;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onPageChange(index)}
                        className={[
                          "anverso-focus flex w-full items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left transition-all",
                          isActive
                            ? "border-[var(--color-green)] bg-[rgba(63,91,74,0.08)]"
                            : "border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-paper)]",
                        ].join(" ")}
                      >
                        <FileText
                          size={14}
                          className={
                            isActive
                              ? "text-[var(--color-green)]"
                              : "text-[var(--color-neutral)]"
                          }
                        />

                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-bold text-[var(--color-text)]">
                            {item.label}
                          </span>

                          <span className="block truncate text-[9.5px] text-[var(--color-neutral)]">
                            {item.title}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-0 lg:mt-4 lg:border-t border-[var(--color-border)] lg:pt-4">
                  <Toggle
                    label="Exibir margens"
                    checked={showGuides}
                    onCheckedChange={() => onToggleGuides()}
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    align="center"
                    trailingIcon={false}
                    icon={Download}
                    className="mt-4 w-full"
                  >
                    Baixar DOCX
                  </Button>
                </div>
              </aside>
              )}
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}