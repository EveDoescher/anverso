"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import {
  FileText, Eye, Download, Save, Trash2, Search, ChevronRight,
  ChevronDown, Calendar, Check, X, Info, AlertTriangle,
  Cloud, Bookmark, Edit2, MoreHorizontal, Plus, Leaf,
  BookOpen, ClipboardList, FileCheck, ArrowLeft, ArrowRight,
  CheckCircle2, Circle, AlertCircle, User, Loader2, XCircle, Menu,
  MessageSquare, Clock
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ShowcasePanel } from "@/components/showcase/ShowcasePanel";
import { ComponentSectionGroup } from "@/components/showcase/ComponentSectionGroup";
import { Chip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Radio } from "@/components/ui/Radio";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { FieldHelper } from "@/components/ui/FieldHelper";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { DateInput } from "@/components/ui/DateInput";
import { Stepper } from "@/components/ui/Stepper";
import { StepDetailCard } from "@/components/ui/StepDetailCard";
import { Alert } from "@/components/ui/Alert";
import { ModalCard } from "@/components/ui/ModalCard";
import { ObservationBubble } from "@/components/ui/ObservationBubble";
import { EmptyState } from "@/components/product/EmptyState";
import { UploadDropzone } from "@/components/product/UploadDropzone";
import { AcademicWorkCard } from "@/components/product/AcademicWorkCard";
import { DocumentStructureCard } from "@/components/product/DocumentStructureCard";
import { ReferenceCard } from "@/components/product/ReferenceCard";
import { WorkFileCard } from "@/components/product/WorkFileCard";
import { ProjectProgressCard } from "@/components/product/ProjectProgressCard";
import { AdvisorNoteCard } from "@/components/product/AdvisorNoteCard";
import { AppNavigationRail } from "@/components/product/AppNavigationRail";
import type { AppNavigationItem } from "@/components/product/AppNavigationRail";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TabNavigation } from "@/components/ui/TabNavigation";
import { DocumentPreview } from "@/components/product/DocumentPreview";
import { SectionShell } from "@/components/ui/SectionShell";

/* ══════════════════════════════════════════════════════
   1. AÇÕES PRINCIPAIS
══════════════════════════════════════════════════════ */
function AcoesPrincipais() {
  const [saved, setSaved] = useState(false);

  const quickActions = [
    { Icon: Edit2, label: "Editar" },
    { Icon: Eye, label: "Visualizar" },
    { Icon: Download, label: "Baixar" },
    { Icon: Bookmark, label: "Favoritar" },
    { Icon: MoreHorizontal, label: "Mais" },
  ];

  return (
    <ShowcasePanel
      number={1}
      title="Ações Principais"
      
    >
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Button variant="primary" size="lg" icon={FileText} className="w-[268px] justify-center">
          Preparar meu DOCX
        </Button>

        <Button variant="ghost" size="lg" trailingIcon={ChevronRight} className="w-[268px]">
          Ver perfis
        </Button>

        <Button
          variant="ghost"
          size="lg"
          icon={FileText}
          trailingIcon={false}
          className="w-[268px]"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {saved ? "Salvo! ✓" : "Salvar rascunho"}
        </Button>

        <Button
          variant="danger"
          size="lg"
          icon={Trash2}
          trailingIcon={false}
          className="w-[268px] bg-[rgba(176,48,48,0.08)]"
        >
          Descartar alterações
        </Button>
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-center gap-2">
        {quickActions.map(({ Icon, label }) => (
          <IconButton key={label} icon={Icon} label={label} />
        ))}
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   2. SELEÇÃO E FILTROS
══════════════════════════════════════════════════════ */
function SelecaoFiltros() {
  const availableChips = ["Normas", "Exemplos", "Citações", "ABNT", "Referências", "Modelos"];
  const [chips, setChips] = useState(["Normas", "Exemplos", "Citações"]);
  const [selectedChip, setSelectedChip] = useState("Normas");

  const [autoReview, setAutoReview] = useState(true);
  const [advisorNotes, setAdvisorNotes] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [workType, setWorkType] = useState("academic");

  const [elements, setElements] = useState({
    cover: true,
    summary: true,
    references: true,
    illustrations: false,
  });

  function handleAddChip() {
    const nextChip = availableChips.find((chip) => !chips.includes(chip));

    if (!nextChip) return;

    setChips((current) => [...current, nextChip]);
    setSelectedChip(nextChip);
  }

  function handleRemoveChip(chipToRemove: string) {
    setChips((current) => {
      const nextChips = current.filter((chip) => chip !== chipToRemove);

      if (selectedChip === chipToRemove) {
        setSelectedChip(nextChips[0] ?? "");
      }

      return nextChips;
    });
  }

  const canAddChip = chips.length < availableChips.length;

  return (
    <ShowcasePanel
      number={2}
      title="Seleção e Filtros"
      
    >
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        <div>
          <p className="mb-3 text-[11px] font-medium text-[var(--color-neutral)]">
            Chips
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Chip
                key={chip}
                selected={selectedChip === chip}
                removable
                onRemove={() => handleRemoveChip(chip)}
                onClick={() => setSelectedChip(chip)}
              >
                {chip}
              </Chip>
            ))}

            {canAddChip ? (
              <Chip aria-label="Adicionar filtro" onClick={handleAddChip}>
                +
              </Chip>
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium text-[var(--color-neutral)]">
            Toggles
          </p>

          <div className="flex flex-col items-start gap-3">
            <Toggle
              label="Revisão automática"
              checked={autoReview}
              onCheckedChange={setAutoReview}
            />

            <Toggle
              label="Notas do orientador"
              checked={advisorNotes}
              onCheckedChange={setAdvisorNotes}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <p className="mb-3 text-[11px] font-medium text-[var(--color-neutral)]">
            Segmented control
          </p>

          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { label: "Tudo", value: "all" },
              { label: "Pendentes", value: "pending" },
              { label: "Concluídos", value: "done" },
            ]}
          />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium text-[var(--color-neutral)]">
            Radio buttons
          </p>

          <div className="space-y-3">
            <Radio
              name="work-type"
              label="Trabalho acadêmico"
              value="academic"
              checked={workType === "academic"}
              onChange={(event) => setWorkType(event.target.value)}
            />

            <Radio
              name="work-type"
              label="Artigo científico"
              value="article"
              checked={workType === "article"}
              onChange={(event) => setWorkType(event.target.value)}
            />

            <Radio
              name="work-type"
              label="Relatório técnico"
              value="report"
              checked={workType === "report"}
              onChange={(event) => setWorkType(event.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium text-[var(--color-neutral)]">
            Checkboxes
          </p>

          <div className="space-y-3">
            <Checkbox
              label="Capa"
              checked={elements.cover}
              onChange={(event) =>
                setElements((current) => ({
                  ...current,
                  cover: event.target.checked,
                }))
              }
            />

            <Checkbox
              label="Sumário"
              checked={elements.summary}
              onChange={(event) =>
                setElements((current) => ({
                  ...current,
                  summary: event.target.checked,
                }))
              }
            />

            <Checkbox
              label="Referências"
              checked={elements.references}
              onChange={(event) =>
                setElements((current) => ({
                  ...current,
                  references: event.target.checked,
                }))
              }
            />

            <Checkbox
              label="Lista de ilustrações"
              checked={elements.illustrations}
              onChange={(event) =>
                setElements((current) => ({
                  ...current,
                  illustrations: event.target.checked,
                }))
              }
            />
          </div>
        </div>
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   3. CAMPOS DE FORMULÁRIO
══════════════════════════════════════════════════════ */
function CamposFormulario() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [workType, setWorkType] = useState("");
  const [date, setDate] = useState("25/05/2026");
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return (
    <ShowcasePanel
      number={3}
      title="Campos de Formulário"
      
      overflow="visible"
    >
      <div className="flex flex-col gap-6">
        <Input
          label="Texto"
          placeholder="Título do trabalho"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <SearchInput
          label="Busca"
          placeholder="Buscar normas, templates, exemplos..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Textarea
          label="Área de texto"
          placeholder="Resumo do seu trabalho..."
          value={summary}
          maxLength={500}
          counter
          onChange={(event) => setSummary(event.target.value)}
        />

        <Input
          label="Campo com máscara"
          placeholder="(19) 99999-9999"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
        />

        <Input
          label="Campo desabilitado"
          value="Informação não editável"
          disabled
          readOnly
        />

        <div>
          <p className="mb-3 text-[14px] font-medium text-[var(--color-text)]">
            Texto de ajuda (helper)
          </p>
          <FieldHelper variant="info">Use o título principal em caixa alta.</FieldHelper>
        </div>

        <Select
          label="Seleção (dropdown)"
          placeholder="Selecione o tipo de trabalho"
          value={workType}
          onValueChange={setWorkType}
          options={[
            { label: "Trabalho acadêmico", value: "academic-work" },
            { label: "Artigo científico", value: "scientific-article" },
            { label: "Relatório técnico", value: "technical-report" },
            { label: "Monografia", value: "monograph" },
          ]}
        />

        <DateInput
          label="Data"
          placeholder="25/05/2026"
          value={date}
          onValueChange={setDate}
        />
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   4. FLUXO GUIADO
══════════════════════════════════════════════════════ */
const STEP_DATA = [
  { label: "Perfil", sub: "Escolha o perfil", Icon: User, gold: false },
  { label: "Capa", sub: "Dados iniciais", Icon: FileText, gold: false },
  { label: "Conteúdo", sub: "Estruture o texto", Icon: BookOpen, gold: false },
  { label: "Revisão", sub: "Confirme os ajustes", Icon: ClipboardList, gold: false },
  { label: "DOCX", sub: "Arquivo pronto", Icon: FileCheck, gold: true },
];

function FluxoGuiado() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      label: "Perfil",
      description: "Escolha o perfil",
    },
    {
      label: "Capa",
      description: "Dados iniciais",
    },
    {
      label: "Conteúdo",
      description: "Estruture seu texto",
    },
    {
      label: "Revisão",
      description: "Confirme os ajustes",
    },
    {
      label: "DOCX",
      description: "Seu arquivo pronto",
    },
  ];

  const descriptions = [
    "Escolha qual perfil de normalização será usado para montar o documento.",
    "Informe os dados principais que vão aparecer na capa e na folha de rosto.",
    "Organize as seções do trabalho antes de gerar a estrutura final.",
    "Revise pendências, campos obrigatórios e ajustes antes de preparar o arquivo.",
    "Tudo pronto para gerar o DOCX com base nas configurações atuais.",
  ];

  return (
    <ShowcasePanel
      number={4}
      title="Fluxo Guiado"
      
      overflow="visible"
    >
      <div className="relative z-10">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />

        <StepDetailCard
          steps={steps}
          currentStep={currentStep}
          description={descriptions[currentStep]}
          onStepChange={setCurrentStep}
          className="mt-16"
        />
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   5. CARDS
══════════════════════════════════════════════════════ */
const CARDS_DATA = [
  { title: "TCC: Marketing Digital", profile: "ABNT UNIP", progress: 65, status: { label: "Em andamento", bg: "#FEF3C7", text: "#8A5800" }, time: "Há 2 horas" },
  { title: "PIM III: Gestão de Projetos", profile: "PIM UNIP", progress: 88, status: { label: "Quase pronto", bg: "#FEF9EC", text: "#8A5800" }, time: "Ontem" },
  { title: "Relatório de Estágio", profile: "ABNT Genérico", progress: 100, status: { label: "Completo", bg: "#E3EDE6", text: "#2D5940" }, time: "3 dias atrás" },
  { title: "Artigo: Inteligência Art.", profile: "Artigo Cient.", progress: 20, status: { label: "Rascunho", bg: "#EDEADF", text: "#5A5040" }, time: "1 semana" },
];

function Cards() {
  const [selectedModel, setSelectedModel] = useState("academic");
  const [progress, setProgress] = useState(80);

  function advanceProgress() {
    setProgress((current) => (current >= 100 ? 35 : Math.min(100, current + 10)));
  }

  return (
    <ShowcasePanel
      number={5}
      title="Cards"
      
      overflow="visible"
    >
      <div className="relative z-10 space-y-5">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-neutral)]">
            Cards de acompanhamento
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start gap-4 [&>*]:min-w-0">
            <WorkFileCard
              title="Trabalho de Conclusão de Curso.docx"
              updatedAt="25/05/2026"
              pages={24}
            />

            <ProjectProgressCard
              eyebrow="Projeto recente"
              title="TCC: Marketing Digital"
              meta="ABNT · salvo há 2 horas"
              progress={progress}
              onContinue={advanceProgress}
            />

            <AdvisorNoteCard
              title="Anotações do orientador"
              note="Ajustar a justificativa e revisar as referências."
              author="Prof. Amanda"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-neutral)]">
            Cards de configuração
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 [&>*]:min-w-0">
            <AcademicWorkCard
              title="Trabalho acadêmico"
              description="Modelo completo para capa, folha de rosto, sumário, seções e referências."
              badge="UNIP"
              status="Mais usado"
              selected={selectedModel === "academic"}
              onSelect={() => setSelectedModel("academic")}
            />

            <AcademicWorkCard
              title="Artigo científico"
              description="Estrutura compacta para produção acadêmica com resumo, palavras-chave e referências."
              badge="ABNT"
              status="Modelo alternativo"
              selected={selectedModel === "article"}
              onSelect={() => setSelectedModel("article")}
            />

            <DocumentStructureCard
              title="Estrutura do documento"
              description="Acompanhe quais partes já estão prontas antes da geração."
              items={[
                { label: "Capa configurada", status: "done" },
                { label: "Folha de rosto pendente", status: "pending" },
                { label: "Sumário automático", status: "done" },
                { label: "Lista de ilustrações", status: "optional" },
              ]}
            />

            <div className="space-y-4">
              <ReferenceCard
                title="Manual de normalização"
                source="Referência institucional usada para conferir regras do perfil."
                status="valid"
              />

              <ReferenceCard
                title="Artigo sobre bancos NoSQL"
                source="Dados de autoria ainda precisam ser revisados."
                status="review"
              />
            </div>
          </div>
        </div>
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   6. FEEDBACK E VALIDAÇÃO
══════════════════════════════════════════════════════ */
function FeedbackValidacao() {
  const [visibleAlerts, setVisibleAlerts] = useState({
    success: true,
    warning: true,
    info: true,
    error: true,
  });

  function dismissAndReturn(key: keyof typeof visibleAlerts) {
    setVisibleAlerts((current) => ({
      ...current,
      [key]: false,
    }));

    setTimeout(() => {
      setVisibleAlerts((current) => ({
        ...current,
        [key]: true,
      }));
    }, 1800);
  }

  const alerts = [
    {
      key: "success" as const,
      tone: "success" as const,
      title: "Seu trabalho está quase pronto!",
      description: "Revise os últimos detalhes e gere seu DOCX.",
    },
    {
      key: "warning" as const,
      tone: "warning" as const,
      title: "Falta apenas informar a cidade da capa.",
      description: "Esse dado é obrigatório para seguir em frente.",
    },
    {
      key: "info" as const,
      tone: "info" as const,
      title: "Dica: mantenha a coesão dos parágrafos.",
      description: "Use conectivos para fortalecer suas ideias.",
    },
    {
      key: "error" as const,
      tone: "error" as const,
      title: "Alguns pontos ainda precisam de ajuste.",
      description: "Veja as sugestões na revisão automática.",
    },
  ];

  return (
    <ShowcasePanel
      number={6}
      title="Feedback e Validação"
      
      overflow="visible"
    >
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            if (!visibleAlerts[alert.key]) return null;

            return (
              <motion.div
                key={alert.key}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20, filter: "blur(4px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Alert
                  tone={alert.tone}
                  title={alert.title}
                  description={alert.description}
                  dismissible
                  onDismiss={() => dismissAndReturn(alert.key)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   7. NAVEGAÇÃO
══════════════════════════════════════════════════════ */
const NAV_STEPS = [
  { label: "Perfil", sub: "ABNT UNIP", done: true, warn: false },
  { label: "Identificação", sub: "Todos os campos", done: true, warn: false },
  { label: "Capa", sub: "Falta a cidade", done: false, warn: true },
  { label: "Folha de Rosto", sub: "Todos os campos", done: true, warn: false },
  { label: "Elementos Iniciais", sub: "3 selecionados", done: true, warn: false },
  { label: "Conteúdo", sub: "Em andamento", done: false, warn: false },
  { label: "Referências", sub: "2 adicionadas", done: false, warn: false },
  { label: "Revisão", sub: "Pendente", done: false, warn: false },
  { label: "DOCX", sub: "Aguardando", done: false, warn: false },
];

function NavegacaoLateral() {
  const [activeArea, setActiveArea] = useState("trabalhos");
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [mockModel, setMockModel] = useState("tcc");
  const [mockTheme, setMockTheme] = useState("light");
  const [mockNotif, setMockNotif] = useState(true);

  const appItems: AppNavigationItem[] = [
    {
      id: "inicio",
      label: "Início",
      description: "Resumo do espaço",
    },
    {
      id: "trabalhos",
      label: "Meus trabalhos",
      description: "Documentos em criação",
      count: 4,
    },
    {
      id: "modelos",
      label: "Modelos",
      description: "Perfis e estruturas",
    },
    {
      id: "biblioteca",
      label: "Biblioteca",
      description: "Materiais salvos",
      count: 12,
    },
    {
      id: "referencias",
      label: "Referências",
      description: "Fontes e citações",
    },
    {
      id: "configuracoes",
      label: "Configurações",
      description: "Preferências do app",
    },
  ];

  const activeItem = appItems.find((item) => item.id === activeArea);

  return (
    <ShowcasePanel
      number={7}
      title="Navegação"
      
      overflow="visible"
    >
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[238px_1fr] gap-4 md:gap-5 items-start">
        {/* Overlay Backdrop */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-[rgba(47,44,45,0.3)] backdrop-blur-sm lg:hidden rounded-[24px]"
              onClick={() => setIsNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Unified Nav Container */}
        <div className="lg:hidden relative w-full z-50">
          {/* Top Bar */}
          <div 
            className={[
              "flex w-full items-center justify-between border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-3 transition-all duration-200 relative z-20",
              isNavOpen ? "rounded-t-[20px] rounded-b-none border-b-0 pb-[13px]" : "rounded-[18px] shadow-sm"
            ].join(" ")}
          >
            <span className="ml-2 text-[14px] font-bold text-[var(--color-text)]">
              {activeItem?.label || "Navegação"}
            </span>
            <IconButton
              variant="ghost"
              icon={isNavOpen ? X : Menu}
              onClick={() => setIsNavOpen(!isNavOpen)}
              label="Alternar menu"
            />
          </div>

          {/* Absolute Dropdown overlaying content */}
          <AnimatePresence>
            {isNavOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full bg-[var(--color-paper-soft)] border border-t-0 border-[var(--color-border)] rounded-b-[20px] shadow-2xl overflow-hidden origin-top z-10 -mt-[1px]"
              >
                <div className="px-3 pb-3 pt-2">
                  <AppNavigationRail
                    items={appItems}
                    activeId={activeArea}
                    onChange={(id) => {
                      setActiveArea(id);
                      setIsNavOpen(false);
                    }}
                    className="!p-0 !border-none !bg-transparent !shadow-none !rounded-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[238px]">
          <AppNavigationRail
            items={appItems}
            activeId={activeArea}
            onChange={setActiveArea}
          />
        </div>

        <div className="min-w-0 w-full flex-1 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-cream-soft)] p-4 md:p-5 min-h-[400px]">
          {activeArea === "inicio" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-start">
                <Breadcrumb items={[{ label: "Início", current: true, onClick: () => setActiveArea("inicio") }]} />
              </div>
              <div className="mt-5 md:mt-6 mb-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Bem-vindo de volta!
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral)]">
                  Aqui está um resumo das suas atividades e atalhos rápidos.
                </p>
              </div>

              <Alert 
                tone="warning"
                title="Prazo próximo"
                description="A entrega final do seu trabalho está agendada para daqui a 5 dias."
                icon={Calendar}
              />

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                 <ProjectProgressCard
                   eyebrow="Continuar editando"
                   title="Impacto da Inteligência Artificial"
                   meta="ABNT · Salvo há 2 horas"
                   progress={85}
                   onContinue={() => {}}
                 />
                 <AdvisorNoteCard
                   title="Anotações do sistema"
                   note="Revisar as referências do Capítulo 3 antes de exportar."
                   author="AnversoBot"
                 />
              </div>
            </div>
          )}

          {activeArea === "modelos" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-start">
                <Breadcrumb items={[{ label: "Início", onClick: () => setActiveArea("inicio") }, { label: "Modelos", current: true }]} />
              </div>
              <div className="mt-5 md:mt-6 mb-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Modelos e Perfis
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral)]">
                  Crie trabalhos já configurados nas normas da sua instituição.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <AcademicWorkCard
                   title="Trabalho de Conclusão"
                   description="Modelo completo com capa, sumário e anexos obrigatórios."
                   badge="ABNT"
                   status={mockModel === "tcc" ? "Mais usado" : undefined}
                   selected={mockModel === "tcc"}
                   onSelect={() => setMockModel("tcc")}
                 />
                 <AcademicWorkCard
                   title="Artigo Científico"
                   description="Estrutura compacta recomendada para publicação em revistas."
                   badge="IEEE"
                   status={mockModel === "article" ? "Recomendado" : undefined}
                   selected={mockModel === "article"}
                   onSelect={() => setMockModel("article")}
                 />
              </div>
            </div>
          )}

          {activeArea === "trabalhos" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-start">
                <Breadcrumb
                  items={[
                    { label: "Início", onClick: () => setActiveArea("inicio") },
                    { label: "Trabalhos", onClick: () => setActiveArea("trabalhos") },
                    { label: "TCC", current: true },
                  ]}
                />
              </div>
              
              <div className="mt-5 md:mt-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Impacto da Inteligência Artificial na Educação
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral)]">
                  Trabalho de Conclusão de Curso • Última edição há 2 horas
                </p>
              </div>

              <div className="mt-6 md:mx-0 md:px-0">
                <TabNavigation
                  items={[
                    { id: "visao-geral", label: "Estrutura ABNT", icon: Eye },
                    { id: "conteudo", label: "Alertas", icon: AlertTriangle, count: 2 },
                  ]}
                  activeId={activeTab === "arquivos" ? "visao-geral" : activeTab}
                  onChange={setActiveTab}
                />
              </div>

              <div className="mt-5">
                {activeTab === "visao-geral" || activeTab === "arquivos" ? (
                  <DocumentStructureCard
                    title="Progresso do Documento"
                    description="Acompanhe o preenchimento dos elementos obrigatórios e opcionais."
                    items={[
                      { label: "Capa e metadados configurados", status: "done" },
                      { label: "Resumo e Abstract redigidos", status: "pending" },
                      { label: "Sumário gerado automaticamente", status: "done" },
                      { label: "Capítulo de Conclusão", status: "pending" },
                    ]}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Alert tone="warning" title="Referência incompleta" description="O autor 'Silva, 2023' citado na página 12 não consta na lista bibliográfica final." />
                    <Alert tone="info" title="Sugestão de formatação" description="A Margem superior está configurada em 3cm, verifique se esse é o padrão da sua universidade." />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeArea === "biblioteca" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-start">
                <Breadcrumb
                  items={[
                    { label: "Início", onClick: () => setActiveArea("inicio") },
                    { label: "Biblioteca", current: true },
                  ]}
                />
              </div>
              
              <div className="mt-5 md:mt-6 mb-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Arquivos e Anexos
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral)]">
                  Gerencie imagens, PDFs e dados brutos vinculados aos seus projetos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <WorkFileCard
                    title="dataset_pesquisa_2026.csv"
                    updatedAt="Ontem"
                    pages={1}
                 />
                 <WorkFileCard
                    title="diagrama_arquitetura.png"
                    updatedAt="12/04/2026"
                    pages={1}
                 />
              </div>
            </div>
          )}

          {activeArea === "referencias" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-start">
                <Breadcrumb
                  items={[
                    { label: "Início", onClick: () => setActiveArea("inicio") },
                    { label: "Referências", current: true },
                  ]}
                />
              </div>

              <div className="mt-5 md:mt-6 mb-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Banco de Referências
                </p>
                <p className="mt-1 text-[13px] text-[var(--color-neutral)]">
                  Cadastre bibliografias prontas para citação automática nos textos.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                 <ReferenceCard
                   title="Design de Interfaces: Uma abordagem centrada no usuário"
                   source="Livro, 3ª Edição, Editora Novatec"
                   status="valid"
                 />
                 <ReferenceCard
                   title="O papel da Inteligência Artificial no frontend moderno"
                   source="Dados de edição e ano de publicação pendentes."
                   status="review"
                 />
              </div>
            </div>
          )}

          {activeArea === "configuracoes" && (
            <div className="animate-in fade-in duration-300">
              <div className="mt-2 md:mt-3 mb-6">
                <p className="font-serif text-[22px] md:text-[27px] font-bold leading-tight text-[var(--color-forest)]">
                  Ajustes da Conta
                </p>
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-[16px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4 gap-4">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-text)]">Modo de Leitura</p>
                    <p className="text-[11px] text-[var(--color-neutral)] mt-0.5">Tema de interface padrão do aplicativo</p>
                  </div>
                  <SegmentedControl
                    options={[
                      { label: "Claro", value: "light" },
                      { label: "Escuro", value: "dark" }
                    ]}
                    value={mockTheme}
                    onChange={(val) => setMockTheme(val)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-[16px] border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--color-text)]">Notificações por E-mail</p>
                    <p className="text-[11px] text-[var(--color-neutral)] mt-0.5">Avisos de colaboração e lembretes</p>
                  </div>
                  <Toggle label="Ativar notificações por e-mail" checked={mockNotif} onCheckedChange={(val) => setMockNotif(val)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShowcasePanel>
  );
}


/* ══════════════════════════════════════════════════════
   8. MODAIS E APOIO
══════════════════════════════════════════════════════ */
function ModaisApoio() {
  const [sectionsCount, setSectionsCount] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");

  function runTemporaryAction(
    setter: Dispatch<SetStateAction<boolean>>,
    duration = 1700,
  ) {
    setter(true);

    setTimeout(() => {
      setter(false);
    }, duration);
  }

  function runSaveAction() {
    setSaveState("saving");

    setTimeout(() => {
      const isSuccess = Math.random() < 0.7; // 70% chance of success
      setSaveState(isSuccess ? "success" : "error");

      setTimeout(() => {
        setSaveState("idle");
      }, 2500);
    }, 1500);
  }

  return (
    <ShowcasePanel
      number={8}
      title="Modais e Apoio"
      
      overflow="visible"
    >
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModalCard
          title={generating ? "Preparando seu DOCX..." : "Gerar o DOCX agora?"}
          description={
            generating
              ? "Estamos organizando o documento com base nas configurações atuais."
              : "Seu documento será finalizado com base nas configurações atuais."
          }
          visual={
            <motion.div
              animate={generating ? { 
                scale: [1, 1.15, 1], 
                rotate: [0, -5, 5, 0],
                filter: ["drop-shadow(0px 0px 0px rgba(0,0,0,0))", "drop-shadow(0px 10px 15px rgba(63,91,74,0.4))", "drop-shadow(0px 0px 0px rgba(0,0,0,0))"]
              } : { 
                scale: 1, 
                rotate: 0,
                filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
              }}
              transition={{ repeat: generating ? Infinity : 0, duration: 1.5, ease: "easeInOut" }}
            >
              <Image
                src="/icons/leaves.png"
                alt=""
                width={70}
                height={54}
                className="object-contain opacity-80"
                unoptimized
              />
            </motion.div>
          }
        >
          <div className="flex flex-col-reverse xl:grid xl:grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              align="center"
              trailingIcon={false}
              disabled={generating}
              className="w-full"
            >
              Cancelar
            </Button>

            <Button
              variant="primary"
              size="sm"
              align="center"
              trailingIcon={false}
              loading={generating}
              onClick={() => runTemporaryAction(setGenerating)}
              className="w-full"
            >
              {generating ? "Gerando..." : "Gerar DOCX"}
            </Button>
          </div>
        </ModalCard>

        <ModalCard
          title={
            saveState === "saving" ? "Salvando seu progresso..." : 
            saveState === "success" ? "Progresso salvo!" : 
            saveState === "error" ? "Falha ao salvar" : 
            "Deseja salvar seu progresso?"
          }
          description={
            saveState === "saving" ? "Guardando suas alterações para você continuar depois." : 
            saveState === "success" ? "Você pode fechar esta tela com segurança." : 
            saveState === "error" ? "Não foi possível guardar. Tente novamente mais tarde." : 
            "Suas alterações serão mantidas para continuar depois."
          }
          visual={
            <div className="flex h-[42px] items-center justify-center">
              <AnimatePresence mode="wait">
                {saveState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image src="/icons/diskette.png" alt="" width={42} height={42} className="object-contain opacity-65" unoptimized />
                  </motion.div>
                )}
                {saveState === "saving" && (
                  <motion.div
                    key="saving"
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 size={38} className="animate-spin text-[var(--color-green)]" />
                  </motion.div>
                )}
                {saveState === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1.2, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <CheckCircle2 size={42} className="text-[var(--color-green)]" />
                  </motion.div>
                )}
                {saveState === "error" && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1.2, 1], opacity: 1, rotate: [0, -15, 15, -15, 15, 0] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    <XCircle size={42} className="text-[var(--color-error)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
        >
          <div className="flex flex-col-reverse xl:grid xl:grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              align="center"
              trailingIcon={false}
              disabled={saveState !== "idle"}
              className="w-full"
            >
              Agora não
            </Button>

            <Button
              variant="primary"
              size="sm"
              align="center"
              trailingIcon={false}
              loading={saveState === "saving"}
              disabled={saveState === "success" || saveState === "error"}
              onClick={runSaveAction}
              className="w-full"
            >
              {saveState === "saving" ? "Salvando..." : saveState === "success" ? "Salvo" : "Salvar"}
            </Button>
          </div>
        </ModalCard>

        <EmptyState
          title={
            sectionsCount === 0
              ? "Ainda não há seções aqui."
              : `${sectionsCount} seção adicionada.`
          }
          description={
            sectionsCount === 0
              ? "Comece adicionando o primeiro capítulo do seu trabalho."
              : "A estrutura inicial do trabalho já começou a ser montada."
          }
          imageSrc="/icons/xicara.png"
          actionLabel="Adicionar seção"
          actionCount={sectionsCount}
          onAction={() => setSectionsCount((current) => current + 1)}
        />

        <UploadDropzone
          title={
            uploaded
              ? "Arquivo recebido."
              : "Arraste arquivos aqui ou clique para enviar"
          }
          description={
            uploaded
              ? "O arquivo foi anexado à demonstração."
              : "PDF, DOCX, JPG ou PNG até 20MB"
          }
          iconSrc={uploaded ? "/icons/OK.png" : "/icons/cloud-computing.png"}
          uploaded={uploaded}
          onClick={() => setUploaded(true)}
        />

        <div className="col-span-full flex justify-end pb-1 pr-1">
          <ObservationBubble text="Clique para adicionar uma observação." />
        </div>
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   9. PRÉVIA DO DOCUMENTO
══════════════════════════════════════════════════════ */
function PreviaDocumento() {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showGuides, setShowGuides] = useState(true);

  const pages = [
    {
      id: 1,
      label: "Capa",
      title: "TÍTULO DO TRABALHO",
      type: "cover" as const,
    },
    {
      id: 2,
      label: "Folha de Rosto",
      title: "TÍTULO DO TRABALHO",
      type: "title-page" as const,
    },
    {
      id: 3,
      label: "Resumo",
      title: "RESUMO",
      type: "abstract" as const,
    },
    {
      id: 4,
      label: "Sumário",
      title: "SUMÁRIO",
      type: "summary" as const,
    },
    {
      id: 5,
      label: "Introdução",
      title: "1 INTRODUÇÃO",
      type: "content" as const,
    },
    {
      id: 6,
      label: "Desenvolvimento",
      title: "2 DESENVOLVIMENTO",
      type: "content" as const,
    },
    {
      id: 7,
      label: "Conclusão",
      title: "3 CONSIDERAÇÕES FINAIS",
      type: "content" as const,
    },
    {
      id: 8,
      label: "Referências",
      title: "REFERÊNCIAS",
      type: "references" as const,
    },
  ];

  return (
    <ShowcasePanel
      number={9}
      title="Prévia do Documento"
      
      overflow="visible"
    >
      <div className="relative z-10">
        <DocumentPreview
          pages={pages}
          currentPage={currentPage}
          showGuides={showGuides}
          onPageChange={setCurrentPage}
          onToggleGuides={() => setShowGuides((current) => !current)}
        />
      </div>
    </ShowcasePanel>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export function ComponentesSection() {
  return (
    <SectionShell
      id="componentes"
      label="Componentes"
      pill="Biblioteca de Interface"
      intro="Cada bloco demonstra componentes reais do produto: ações, formulários, jornada guiada, estados e navegação."
    >
      <div className="space-y-10">
        <ComponentSectionGroup
          eyebrow="Entrada e escolha"
          title="Começo da experiência"
          description="Ações, filtros e campos aparecem juntos como o primeiro contato do usuário com a criação do documento. O bloco prioriza escolha rápida, entrada de dados e clareza visual."
        >
          <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <AcoesPrincipais />
            <SelecaoFiltros />
          </div>

          <div className="mt-5">
            <CamposFormulario />
          </div>
        </ComponentSectionGroup>

        <ComponentSectionGroup
          eyebrow="Construção do trabalho"
          title="Jornada e acompanhamento"
          description="O fluxo guiado mostra o passo a passo de criação, enquanto os cards simulam o acompanhamento real de documentos, projetos recentes, modelos e referências."
        >
          <div className="space-y-5">
            <FluxoGuiado />
            <Cards />
          </div>
        </ComponentSectionGroup>

        <ComponentSectionGroup
          eyebrow="Estados e apoio"
          title="Respostas do sistema"
          description="Feedbacks, confirmações, uploads, estados vazios e ajudas contextuais aparecem como apoio ao usuário, sem competir com o fluxo principal."
        >
          <div className="grid items-start gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <FeedbackValidacao />
            <ModaisApoio />
          </div>
        </ComponentSectionGroup>

        <ComponentSectionGroup
          eyebrow="Navegação e resultado"
          title="Movimento pelo produto"
          description="A navegação organiza as áreas da plataforma, enquanto a prévia mostra o resultado visual do documento antes da geração final."
        >
          <div className="space-y-5">
            <NavegacaoLateral />
            <PreviaDocumento />
          </div>
        </ComponentSectionGroup>
      </div>
    </SectionShell>
  );
}
