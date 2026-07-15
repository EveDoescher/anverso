"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Settings2, 
  FileText, 
  Download,
  LayoutTemplate,
  CheckCircle2,
  Cpu,
  Layers
} from "lucide-react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const leafY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  return (
    <div ref={containerRef} className="relative min-h-screen bg-[var(--color-paper)] overflow-hidden selection:bg-[var(--color-gold)] selection:text-white">
      
      {/* Decorações Botânicas Fixas */}
      <motion.div style={{ y: leafY }} className="fixed -left-[100px] -top-[50px] z-0 hidden opacity-[0.15] md:block mix-blend-color-burn">
        <Image src="/icons/leaves.png" alt="" width={600} height={600} unoptimized priority />
      </motion.div>
      <Image
        src="/icons/leaves.png" alt="" width={500} height={500}
        className="pointer-events-none fixed -bottom-[100px] -right-[80px] z-0 hidden rotate-[135deg] opacity-[0.20] lg:block mix-blend-color-burn"
        unoptimized priority
      />

      {/* --- NAV BAR --- */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/icons/xicara.png" alt="Anverso Logo" width={28} height={28} unoptimized />
          <span className="font-serif text-xl font-bold text-[var(--color-espresso)] tracking-tight">Anverso</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[var(--color-forest)] font-medium text-sm hover:opacity-70 transition-opacity">
            Entrar
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="hidden sm:inline-flex rounded-full px-6">
              Começar Grátis
            </Button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-border-soft)] mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-green)] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-coffee)]">Motor de Renderização DOCX</span>
          </div>
          
          <h1 className="font-serif leading-[0.9] text-[var(--color-forest)] mb-8" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", letterSpacing: "-0.04em" }}>
            Engenharia de Documentos, <br />
            <span className="italic text-[var(--color-coffee)]">Automatizada.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl font-sans font-light leading-relaxed text-[var(--color-neutral)] mb-12">
            A infraestrutura definitiva para formatar trabalhos acadêmicos e técnicos. 
            Defina perfis tipográficos no <strong>Construtor JSON</strong> e deixe nosso motor compilar arquivos nativos perfeitos.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/register" className="w-full sm:w-auto" tabIndex={-1}>
            <Button variant="gold" size="lg" className="w-full h-14 px-8 text-base shadow-[var(--shadow-soft)] hover:shadow-lg transition-all rounded-xl">
              Criar Conta Gratuita
            </Button>
          </Link>
          <Link href="/explore" className="w-full sm:w-auto" tabIndex={-1}>
            <Button variant="ghost" size="lg" className="w-full h-14 px-8 text-base border border-[var(--color-border-strong)] bg-white/50 backdrop-blur rounded-xl text-[var(--color-forest)] hover:bg-white/80">
              Explorar Comunidade
            </Button>
          </Link>
        </motion.div>

        <motion.div style={{ opacity: opacityFade }} className="mt-20">
          <div className="w-[1px] h-16 bg-gradient-to-b from-[var(--color-gold)] to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* --- PIPELINE DEMO (UI-UX PRO MAX: Visual Demo) --- */}
      <section className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="rounded-3xl bg-[var(--color-cream)] border border-[var(--color-border)] shadow-2xl overflow-hidden p-2 md:p-4"
          >
            <div className="rounded-2xl border border-[var(--color-border-soft)] bg-white/60 backdrop-blur flex flex-col md:flex-row items-stretch">
              {/* Input: Profile */}
              <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--color-border-soft)]">
                <div className="flex items-center gap-3 mb-6">
                  <Settings2 className="text-[var(--color-coffee)]" />
                  <h3 className="font-serif text-2xl text-[var(--color-espresso)]">1. Perfil JSONB</h3>
                </div>
                <div className="font-mono text-xs text-[var(--color-neutral)] bg-[var(--color-paper)] p-4 rounded-lg border border-[var(--color-border-soft)]">
                  <span className="text-[var(--color-gold)]">"pageRule"</span>: &#123;<br/>
                  &nbsp;&nbsp;<span className="text-[var(--color-green)]">"widthCm"</span>: 21.0,<br/>
                  &nbsp;&nbsp;<span className="text-[var(--color-green)]">"marginTopCm"</span>: 3.0<br/>
                  &#125;,<br/>
                  <span className="text-[var(--color-gold)]">"styleRules"</span>: [...]
                </div>
              </div>

              {/* Input: Content */}
              <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--color-border-soft)] relative">
                <div className="absolute top-1/2 -left-4 md:-left-5 w-8 h-8 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center font-bold shadow-lg md:translate-y-[-50%] transform rotate-90 md:rotate-0 z-10">
                  +
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="text-[var(--color-forest)]" />
                  <h3 className="font-serif text-2xl text-[var(--color-espresso)]">2. Conteúdo Bruto</h3>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-[var(--color-border-strong)] rounded" />
                  <div className="h-2 w-full bg-[var(--color-border-strong)] rounded" />
                  <div className="h-2 w-5/6 bg-[var(--color-border-strong)] rounded" />
                  <div className="h-12 w-full border border-dashed border-[var(--color-coffee)] rounded flex items-center justify-center text-xs text-[var(--color-coffee)] opacity-60">Tabela de Dados</div>
                </div>
              </div>

              {/* Output: DOCX */}
              <div className="flex-1 p-8 md:p-12 bg-[var(--color-success-bg)] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 md:top-1/2 md:-left-4 md:translate-x-0 w-8 h-8 rounded-full bg-[var(--color-green)] text-white flex items-center justify-center font-bold shadow-lg md:translate-y-[-50%] transform rotate-90 md:rotate-0 z-10">
                  =
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Download className="text-[var(--color-green)]" />
                  <h3 className="font-serif text-2xl text-[var(--color-espresso)]">3. Output .DOCX</h3>
                </div>
                <div className="bg-white p-4 shadow-sm border border-[var(--color-border-soft)] rounded h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[var(--color-success-bg)] rounded-lg flex items-center justify-center text-[var(--color-green)] mb-3">
                    <FileText size={24} />
                  </div>
                  <span className="font-bold text-sm text-[var(--color-espresso)]">documento_abnt.docx</span>
                  <span className="text-xs text-[var(--color-neutral)] mt-1">Margens e estilos aplicados perfeitamente</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="relative z-10 py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-forest)] mb-4">Arquitetura Dumb Executor.</h2>
            <p className="text-[var(--color-neutral)] text-lg max-w-2xl font-light">
              Nenhuma regra hardcoded. O motor de renderização apenas lê as preferências paramétricas e compila estruturas de dados complexas em layout tipográfico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
            {/* Bento 1: Large */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-white/70 backdrop-blur border border-[var(--color-border-soft)] p-8 flex flex-col justify-between hover:shadow-[var(--shadow-soft)] transition-shadow group"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-2xl text-[var(--color-espresso)]">Construtor de Perfis Visuais</h3>
                <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center text-[var(--color-coffee)] group-hover:bg-[var(--color-coffee)] group-hover:text-white transition-colors">
                  <Settings2 size={20} />
                </div>
              </div>
              <p className="text-[var(--color-neutral)] leading-relaxed max-w-md">
                Configure regras de página, paginação complexa (ex: iniciar numeração na folha 3), fontes, margens, espaçamentos e estilos de citação em uma interface intuitiva.
              </p>
            </motion.div>

            {/* Bento 2: Small */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-1 md:row-span-1 rounded-3xl bg-[var(--color-cream)] border border-[var(--color-border)] p-8 flex flex-col justify-between hover:shadow-[var(--shadow-soft)] transition-shadow group"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-2xl text-[var(--color-espresso)]">Estrutura Recursiva</h3>
                <Layers size={20} className="text-[var(--color-forest)]" />
              </div>
              <p className="text-[var(--color-neutral)] text-sm">
                Envie dados como blocos, tabelas, quadros, citações e índices. O sistema gerencia hierarquias complexas automaticamente.
              </p>
            </motion.div>

            {/* Bento 3: Small */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-1 md:row-span-1 rounded-3xl bg-white/70 backdrop-blur border border-[var(--color-border-soft)] p-8 flex flex-col justify-between hover:shadow-[var(--shadow-soft)] transition-shadow group"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-2xl text-[var(--color-espresso)]">Validação Estrita</h3>
                <CheckCircle2 size={20} className="text-[var(--color-gold)]" />
              </div>
              <p className="text-[var(--color-neutral)] text-sm">
                Se os dados não estiverem compatíveis com o Profile, o sistema aponta o erro instantaneamente antes de compilar.
              </p>
            </motion.div>

            {/* Bento 4: Large */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2 md:row-span-1 rounded-3xl bg-[var(--color-forest)] text-white p-8 flex flex-col justify-between shadow-lg overflow-hidden relative group"
            >
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Cpu size={200} />
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <h3 className="font-serif text-2xl text-[var(--color-cream)]">Submissão Independente</h3>
                <LayoutTemplate size={20} className="text-[var(--color-gold)]" />
              </div>
              <p className="relative z-10 text-[var(--color-paper)] leading-relaxed max-w-lg opacity-90">
                O autor do trabalho apenas preenche os slots necessários (Autores, Resumo, Capítulos) e o motor distribui espacialmente os elementos na página de acordo com a heurística de layout do Perfil selecionado.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center rounded-[3rem] bg-white border border-[var(--color-border-soft)] p-16 shadow-[var(--shadow-soft)] relative overflow-hidden">
          {/* Subtle bg element */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--color-cream)]/30 to-transparent pointer-events-none" />
          
          <Image src="/icons/xicara.png" alt="" width={40} height={40} className="mx-auto opacity-70 mb-8 relative z-10" unoptimized />
          
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--color-espresso)] mb-6 relative z-10">
            Pronto para padronizar?
          </h2>
          <p className="text-[var(--color-neutral)] text-lg mb-10 relative z-10">
            Junte-se a instituições e autores que automatizaram suas formatações ABNT e institucionais.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/register" tabIndex={-1}>
              <Button variant="primary" size="lg" className="px-10 h-14 rounded-xl w-full sm:w-auto">
                Criar Conta Gratuita
              </Button>
            </Link>
            <Link href="/explore" tabIndex={-1}>
              <Button variant="ghost" size="lg" className="px-10 h-14 rounded-xl w-full sm:w-auto text-[var(--color-forest)]">
                Ver Trabalhos
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-20 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[var(--color-gold)]">
            Papel · Planta · Café
          </p>
          <p className="text-xs text-[var(--color-neutral)] opacity-60">
            © {new Date().getFullYear()} Anverso SaaS. Todos os direitos reservados.
          </p>
        </div>
      </section>
    </div>
  );
}
