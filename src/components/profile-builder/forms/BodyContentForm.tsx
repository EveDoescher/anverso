'use client';

import { BodyContentState } from '@/lib/profileSerializer';
import * as Accordion from '@radix-ui/react-accordion';

interface Props {
  state: BodyContentState;
  onChange: (updated: BodyContentState) => void;
}

function tf(label: string, value: string, onChange: (v: string) => void) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function nf(label: string, value: number, onChange: (v: number) => void, step = 1, min = 0) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <input type="number" step={step} min={min} className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function sf<T extends string>(label: string, value: T, options: { value: T; label: string }[], onChange: (v: T) => void) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <select className="w-full border border-slate-200 rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
        value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ck(label: string, checked: boolean, onChange: (v: boolean) => void) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </label>
  );
}

const NUMBERING_STRATEGIES: { value: 'GLOBAL_SEQUENTIAL' | 'BY_CHAPTER'; label: string }[] = [
  { value: 'GLOBAL_SEQUENTIAL', label: 'Sequencial global' },
  { value: 'BY_CHAPTER', label: 'Por capítulo' },
];

const ALIGNMENTS: { value: 'CENTER' | 'LEFT' | 'RIGHT'; label: string }[] = [
  { value: 'CENTER', label: 'Centralizado' },
  { value: 'LEFT', label: 'Esquerda' },
  { value: 'RIGHT', label: 'Direita' },
];

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

export function BodyContentForm({ state, onChange }: Props) {
  const bc = state;

  function setNb<K extends keyof BodyContentState['numbering']>(k: K, v: BodyContentState['numbering'][K]) {
    onChange({ ...bc, numbering: { ...bc.numbering, [k]: v } });
  }
  function setLayout<K extends keyof BodyContentState['layout']>(k: K, v: BodyContentState['layout'][K]) {
    onChange({ ...bc, layout: { ...bc.layout, [k]: v } });
  }
  function setCf<K extends keyof BodyContentState['citationFormatting']>(k: K, v: BodyContentState['citationFormatting'][K]) {
    onChange({ ...bc, citationFormatting: { ...bc.citationFormatting, [k]: v } });
  }
  function setCrl<K extends keyof BodyContentState['crossReferenceLabels']>(k: K, v: BodyContentState['crossReferenceLabels'][K]) {
    onChange({ ...bc, crossReferenceLabels: { ...bc.crossReferenceLabels, [k]: v } });
  }
  function setFig<K extends keyof BodyContentState['figure']>(k: K, v: BodyContentState['figure'][K]) {
    onChange({ ...bc, figure: { ...bc.figure, [k]: v } });
  }
  function setTbl<K extends keyof BodyContentState['table']>(k: K, v: BodyContentState['table'][K]) {
    onChange({ ...bc, table: { ...bc.table, [k]: v } });
  }
  function setFrm<K extends keyof BodyContentState['frame']>(k: K, v: BodyContentState['frame'][K]) {
    onChange({ ...bc, frame: { ...bc.frame, [k]: v } });
  }
  function setCode<K extends keyof BodyContentState['codeListing']>(k: K, v: BodyContentState['codeListing'][K]) {
    onChange({ ...bc, codeListing: { ...bc.codeListing, [k]: v } });
  }
  function setChart<K extends keyof BodyContentState['chart']>(k: K, v: BodyContentState['chart'][K]) {
    onChange({ ...bc, chart: { ...bc.chart, [k]: v } });
  }
  function setEq<K extends keyof BodyContentState['equation']>(k: K, v: BodyContentState['equation'][K]) {
    onChange({ ...bc, equation: { ...bc.equation, [k]: v } });
  }

  const inlineHeadingLevels = bc.layout.inlineHeadingLevels ?? [];
  function toggleInlineLevel(level: number, checked: boolean) {
    const next = checked
      ? [...inlineHeadingLevels, level].sort((a, b) => a - b)
      : inlineHeadingLevels.filter(l => l !== level);
    setLayout('inlineHeadingLevels', next.length > 0 ? next : undefined);
  }

  return (
    <div className="space-y-2">
      <Accordion.Root type="multiple" className="space-y-2">

        {/* Parágrafos e Títulos */}
        <Accordion.Item value="paragraphs" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Parágrafos e Títulos <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 space-y-3 border-t border-slate-100">
            {ck('Numeração automática de seções (ex: 1.2.3)', bc.numbering.enabled, v => setNb('enabled', v))}
            <div className="grid grid-cols-2 gap-2 ml-6">
              {tf('Separador', bc.numbering.separator, v => setNb('separator', v))}
              {tf('Sufixo primário', bc.numbering.primarySuffix, v => setNb('primarySuffix', v))}
            </div>
            {ck('Quebra de página antes de seção nível 1', bc.layout.pageBreakBeforePrimarySection, v => setLayout('pageBreakBeforePrimarySection', v))}
            {ck('Manter título junto ao parágrafo seguinte', bc.layout.keepWithNextOnHeadings, v => setLayout('keepWithNextOnHeadings', v))}
            <div className="grid grid-cols-2 gap-2">
              {nf('Linhas em branco antes do título', bc.layout.blankLinesBeforeSectionTitleWhenPrecededByContent, v => setLayout('blankLinesBeforeSectionTitleWhenPrecededByContent', v))}
              {nf('Linhas em branco após o título', bc.layout.blankLinesAfterSectionTitle, v => setLayout('blankLinesAfterSectionTitle', v))}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Títulos inline (run-in heading) — APA níveis 4 e 5</label>
              <div className="flex gap-3 flex-wrap">
                {HEADING_LEVELS.map(level => (
                  <label key={level} className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700">
                    <input type="checkbox" className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                      checked={inlineHeadingLevels.includes(level)}
                      onChange={e => toggleInlineLevel(level, e.target.checked)} />
                    Nível {level}
                  </label>
                ))}
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Citações */}
        <Accordion.Item value="citations" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Citações <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Prefixo de página', bc.citationFormatting.pagePrefix, v => setCf('pagePrefix', v))}
              {tf('Separador multi-autor', bc.citationFormatting.multiAuthorJoiner, v => setCf('multiAuthorJoiner', v))}
              {tf('Marcador et al.', bc.citationFormatting.etAl, v => setCf('etAl', v))}
              {tf('Conector apud', bc.citationFormatting.apudConnector, v => setCf('apudConnector', v))}
              {tf('Marcador de supressão', bc.citationFormatting.suppressionMarker, v => setCf('suppressionMarker', v))}
              {tf('Rótulo grifo nosso', bc.citationFormatting.emphasisOursLabel, v => setCf('emphasisOursLabel', v))}
              {tf('Rótulo grifo do autor', bc.citationFormatting.emphasisAuthorLabel, v => setCf('emphasisAuthorLabel', v))}
              {tf('Rótulo informação verbal', bc.citationFormatting.verbalCitationLabel, v => setCf('verbalCitationLabel', v))}
              {tf('Separador Autor/Ano', bc.citationFormatting.authorYearSeparator, v => setCf('authorYearSeparator', v))}
              {tf('Separador ref./página', bc.citationFormatting.pageReferenceSeparator, v => setCf('pageReferenceSeparator', v))}
              {tf('Parêntese abre', bc.citationFormatting.parenOpen, v => setCf('parenOpen', v))}
              {tf('Parêntese fecha', bc.citationFormatting.parenClose, v => setCf('parenClose', v))}
              {tf('Separador de múltiplas fontes', bc.citationFormatting.multiSourceSeparator, v => setCf('multiSourceSeparator', v))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Rótulos de referência cruzada */}
        <Accordion.Item value="crossref" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Rótulos de Referência Cruzada <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Seção', bc.crossReferenceLabels.sectionLabel, v => setCrl('sectionLabel', v))}
              {tf('Figura', bc.crossReferenceLabels.figureLabel, v => setCrl('figureLabel', v))}
              {tf('Tabela', bc.crossReferenceLabels.tableLabel, v => setCrl('tableLabel', v))}
              {tf('Quadro', bc.crossReferenceLabels.frameLabel, v => setCrl('frameLabel', v))}
              {tf('Gráfico', bc.crossReferenceLabels.chartLabel, v => setCrl('chartLabel', v))}
              {tf('Listagem', bc.crossReferenceLabels.codeListingLabel, v => setCrl('codeListingLabel', v))}
              {tf('Equação', bc.crossReferenceLabels.equationLabel, v => setCrl('equationLabel', v))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Figuras */}
        <Accordion.Item value="figures" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Figuras <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de legenda', bc.figure.captionTemplate, v => setFig('captionTemplate', v))}
              {tf('Template de fonte', bc.figure.sourceTemplate, v => setFig('sourceTemplate', v))}
              {sf('Alinhamento', bc.figure.alignment, ALIGNMENTS, v => setFig('alignment', v))}
              {sf('Numeração', bc.figure.numberingStrategy, NUMBERING_STRATEGIES, v => setFig('numberingStrategy', v))}
              {tf('Rótulo', bc.figure.label, v => setFig('label', v))}
              {nf('Largura máx. (cm)', bc.figure.maxWidthCm ?? 16, v => setFig('maxWidthCm', v), 0.5)}
              {nf('Altura máx. (cm)', bc.figure.maxHeightCm ?? 20, v => setFig('maxHeightCm', v), 0.5)}
            </div>
            <p className="text-[9px] text-slate-400 mt-2">Tokens: <code>{'{number}'}</code> = número, <code>{'{caption}'}</code> = legenda, <code>{'{source}'}</code> = fonte</p>
          </Accordion.Content>
        </Accordion.Item>

        {/* Tabelas */}
        <Accordion.Item value="tables" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Tabelas <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de legenda', bc.table.captionTemplate, v => setTbl('captionTemplate', v))}
              {tf('Template de fonte', bc.table.sourceTemplate, v => setTbl('sourceTemplate', v))}
              {sf('Alinhamento', bc.table.alignment, ALIGNMENTS, v => setTbl('alignment', v))}
              {sf('Numeração', bc.table.numberingStrategy, NUMBERING_STRATEGIES, v => setTbl('numberingStrategy', v))}
              {tf('Rótulo', bc.table.label, v => setTbl('label', v))}
              {nf('Largura (%)', bc.table.widthPercent, v => setTbl('widthPercent', v))}
            </div>
            {ck('Repetir cabeçalho em quebra de página', bc.table.repeatHeaderOnPageBreak, v => setTbl('repeatHeaderOnPageBreak', v))}
            <p className="text-[9px] text-slate-400">Tokens: <code>{'{number}'}</code>, <code>{'{caption}'}</code>, <code>{'{source}'}</code></p>
          </Accordion.Content>
        </Accordion.Item>

        {/* Quadros */}
        <Accordion.Item value="frames" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Quadros <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de legenda', bc.frame.captionTemplate, v => setFrm('captionTemplate', v))}
              {tf('Template de fonte', bc.frame.sourceTemplate, v => setFrm('sourceTemplate', v))}
              {sf('Alinhamento', bc.frame.alignment, ALIGNMENTS, v => setFrm('alignment', v))}
              {sf('Numeração', bc.frame.numberingStrategy, NUMBERING_STRATEGIES, v => setFrm('numberingStrategy', v))}
              {tf('Rótulo', bc.frame.label, v => setFrm('label', v))}
              {nf('Largura (%)', bc.frame.widthPercent, v => setFrm('widthPercent', v))}
            </div>
            {ck('Repetir cabeçalho em quebra de página', bc.frame.repeatHeaderOnPageBreak, v => setFrm('repeatHeaderOnPageBreak', v))}
          </Accordion.Content>
        </Accordion.Item>

        {/* Gráficos */}
        <Accordion.Item value="charts" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Gráficos <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de legenda', bc.chart.captionTemplate, v => setChart('captionTemplate', v))}
              {tf('Template de fonte', bc.chart.sourceTemplate, v => setChart('sourceTemplate', v))}
              {sf('Alinhamento', bc.chart.alignment, ALIGNMENTS, v => setChart('alignment', v))}
              {sf('Numeração', bc.chart.numberingStrategy, NUMBERING_STRATEGIES, v => setChart('numberingStrategy', v))}
              {tf('Rótulo', bc.chart.label, v => setChart('label', v))}
              {nf('Largura máx. (cm)', bc.chart.maxWidthCm ?? 16, v => setChart('maxWidthCm', v), 0.5)}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Código */}
        <Accordion.Item value="code" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Listagens de Código <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de legenda', bc.codeListing.captionTemplate, v => setCode('captionTemplate', v))}
              {tf('Família de fonte', bc.codeListing.fontFamily, v => setCode('fontFamily', v))}
              {nf('Tamanho (pt)', bc.codeListing.fontSizePt, v => setCode('fontSizePt', v), 0.5)}
              {sf('Numeração', bc.codeListing.numberingStrategy, NUMBERING_STRATEGIES, v => setCode('numberingStrategy', v))}
              {tf('Rótulo', bc.codeListing.label, v => setCode('label', v))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Equações */}
        <Accordion.Item value="equations" className="border border-slate-200 rounded-lg overflow-hidden">
          <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Equações <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {tf('Template de numeração', bc.equation.numberingTemplate, v => setEq('numberingTemplate', v))}
              {sf('Alinhamento da equação', bc.equation.alignment, ALIGNMENTS, v => setEq('alignment', v))}
              {sf('Numeração', bc.equation.numberingStrategy, NUMBERING_STRATEGIES, v => setEq('numberingStrategy', v))}
              {tf('Rótulo', bc.equation.label, v => setEq('label', v))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

      </Accordion.Root>
    </div>
  );
}
