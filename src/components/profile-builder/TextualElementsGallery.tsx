'use client';

import { useState } from 'react';
import {
  BodyContentState,
  ElementFormatState,
  TableFormatState,
  CodeFormatState,
  EquationFormatState,
  DirectCitationState,
  LongDirectCitationState,
  FootnoteState,
} from '@/lib/profileSerializer';

interface Props {
  state: BodyContentState;
  onChange: (updated: BodyContentState) => void;
}

// ── Mini-schema SVG/HTML renderers ──

function FigureSchema({ captionTemplate, label }: { captionTemplate: string; label: string }) {
  const preview = captionTemplate.replace('{n}', '1').replace('{caption}', 'Distribuição dos dados');
  return (
    <div className="space-y-1 text-center">
      <div className="mx-auto w-20 h-12 bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs">imagem</div>
      <div className="text-[10px] text-slate-600 font-medium">{label} 1 — {preview.split('—')[1]?.trim() ?? preview}</div>
      <div className="text-[9px] text-slate-400">Fonte: elaborado pelo autor.</div>
    </div>
  );
}

function TableSchema({ captionTemplate, label }: { captionTemplate: string; label: string }) {
  return (
    <div className="space-y-1 text-center">
      <div className="text-[10px] text-slate-600 font-medium">{label} 1 — Exemplo de legenda acima</div>
      <table className="mx-auto text-[9px] border-collapse">
        <thead>
          <tr className="border-t-2 border-b border-slate-400">
            <th className="px-2 py-0.5 text-left border-r border-slate-300">Col 1</th>
            <th className="px-2 py-0.5 text-left border-r border-slate-300">Col 2</th>
            <th className="px-2 py-0.5 text-left">Col 3</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b-2 border-slate-400">
            <td className="px-2 py-0.5 border-r border-slate-300">A</td>
            <td className="px-2 py-0.5 border-r border-slate-300">B</td>
            <td className="px-2 py-0.5">C</td>
          </tr>
        </tbody>
      </table>
      <div className="text-[9px] text-slate-400">Fonte: elaborado pelo autor.</div>
    </div>
  );
}

function EquationSchema({ numberingTemplate, label }: { numberingTemplate: string; label: string }) {
  const num = numberingTemplate.replace('{num}', '1');
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-center font-italic text-sm text-slate-700" style={{ fontStyle: 'italic' }}>
        E = mc²
      </div>
      <div className="text-[10px] text-slate-500">{num}</div>
    </div>
  );
}

function CodeSchema() {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-slate-600 font-medium">Listagem 1 — Algoritmo de ordenação</div>
      <pre className="bg-slate-100 rounded px-2 py-1 text-[9px] font-mono text-slate-700 text-left">
{`def sort(arr):
    return sorted(arr)`}
      </pre>
    </div>
  );
}

function DirectCitationSchema({ state }: { state: DirectCitationState }) {
  return (
    <div className="text-[10px] text-slate-600 leading-relaxed text-left">
      ...o pesquisador afirma que {state.openQuote}a metodologia aplicada revelou resultados significativos{state.closeQuote} (SILVA, 2024, p. 42) e conclui...
    </div>
  );
}

function LongDirectCitationSchema({ state }: { state: LongDirectCitationState }) {
  return (
    <div className="text-[10px] text-slate-600 leading-relaxed text-left border-l-2 border-slate-300 pl-2"
      style={{ marginLeft: `${state.leftIndentCm * 6}px`, fontSize: `${Math.min(state.fontSizePt, 11)}px` }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. (AUTOR, 2024, p. 45)
    </div>
  );
}

function FootnoteSchema({ state }: { state: FootnoteState }) {
  return (
    <div className="text-left space-y-1">
      <div className="text-[10px] text-slate-600">...texto do parágrafo com nota de rodapé¹ continua normalmente aqui.</div>
      <div className="border-t border-slate-400 pt-1" style={{ width: `${state.separatorWidthPct}%` }}>
        <div className="text-[9px] text-slate-500" style={{ fontSize: `${Math.min(state.fontSizePt, 10)}px` }}>
          ¹ Nota de rodapé com informações adicionais sobre o assunto.
        </div>
      </div>
    </div>
  );
}

// ── Field editors ──

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function LabeledNumber({ label, value, onChange, step = 0.5, min = 0 }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; min?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <input type="number" step={step} min={min} className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function LabeledSelect<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
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

const NUMBERING_OPTS = [
  { value: 'GLOBAL_SEQUENTIAL' as const, label: 'Sequencial global' },
  { value: 'BY_CHAPTER' as const, label: 'Por capítulo' },
];

const ALIGN_OPTS = [
  { value: 'CENTER' as const, label: 'Centralizado' },
  { value: 'LEFT' as const, label: 'Esquerda' },
  { value: 'RIGHT' as const, label: 'Direita' },
];

// ── Card component ──

interface CardDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  schema: (state: BodyContentState) => React.ReactNode;
  editor: (state: BodyContentState, onChange: (s: BodyContentState) => void) => React.ReactNode;
}

const CARDS: CardDef[] = [
  {
    id: 'figure',
    label: 'Figura',
    icon: '🖼',
    description: 'Imagens, fotos, mapas e ilustrações',
    schema: (s) => <FigureSchema captionTemplate={s.figure.captionTemplate} label={s.figure.label} />,
    editor: (s, onChange) => {
      const fig = s.figure;
      function set<K extends keyof ElementFormatState>(k: K, v: ElementFormatState[K]) {
        onChange({ ...s, figure: { ...fig, [k]: v } });
      }
      const captionPreview = fig.captionTemplate.replace('{n}', '1').replace('{caption}', 'Mapa do Brasil');
      const sourcePreview = fig.sourceTemplate.replace('{source}', 'IBGE (2024)');
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Prévia</div>
            <div className="mx-auto w-24 h-14 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-[9px]">imagem</div>
            <div className="text-[10px] font-medium text-slate-700">{captionPreview}</div>
            <div className="text-[9px] text-slate-500">{sourcePreview}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Rótulo" value={fig.label} onChange={v => set('label', v)} />
            <LabeledSelect label="Numeração" value={fig.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
            <LabeledInput label="Template de legenda" value={fig.captionTemplate} onChange={v => set('captionTemplate', v)} />
            <LabeledInput label="Template de fonte" value={fig.sourceTemplate} onChange={v => set('sourceTemplate', v)} />
            <LabeledSelect label="Alinhamento" value={fig.alignment} options={ALIGN_OPTS} onChange={v => set('alignment', v)} />
            <LabeledNumber label="Largura máx. (cm)" value={fig.maxWidthCm ?? 16} onChange={v => set('maxWidthCm', v)} />
          </div>
          <p className="text-[9px] text-slate-400">Variáveis: {'{n}'} = número, {'{caption}'} = legenda, {'{source}'} = fonte</p>
        </div>
      );
    },
  },
  {
    id: 'table',
    label: 'Tabela',
    icon: '📊',
    description: 'Tabelas com dados numéricos e textuais',
    schema: (s) => <TableSchema captionTemplate={s.table.captionTemplate} label={s.table.label} />,
    editor: (s, onChange) => {
      const tbl = s.table;
      function set<K extends keyof TableFormatState>(k: K, v: TableFormatState[K]) {
        onChange({ ...s, table: { ...tbl, [k]: v } });
      }
      const captionPreview = tbl.captionTemplate.replace('{n}', '1').replace('{caption}', 'Distribuição por região');
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Prévia</div>
            <div className="text-[10px] font-medium text-slate-700">{captionPreview}</div>
            <table className="mx-auto text-[9px] border-collapse">
              <thead><tr className="border-t-2 border-b border-slate-400">
                <th className="px-2 py-0.5 border-r border-slate-300">Região</th>
                <th className="px-2 py-0.5">Valor</th>
              </tr></thead>
              <tbody><tr className="border-b-2 border-slate-400">
                <td className="px-2 py-0.5 border-r border-slate-300">Sul</td>
                <td className="px-2 py-0.5">42%</td>
              </tr></tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Rótulo" value={tbl.label} onChange={v => set('label', v)} />
            <LabeledSelect label="Numeração" value={tbl.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
            <LabeledInput label="Template de legenda" value={tbl.captionTemplate} onChange={v => set('captionTemplate', v)} />
            <LabeledInput label="Template de fonte" value={tbl.sourceTemplate} onChange={v => set('sourceTemplate', v)} />
            <LabeledSelect label="Alinhamento" value={tbl.alignment} options={ALIGN_OPTS} onChange={v => set('alignment', v)} />
            <LabeledNumber label="Largura (%)" value={tbl.widthPercent} onChange={v => set('widthPercent', v)} step={5} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300"
              checked={tbl.repeatHeaderOnPageBreak} onChange={e => set('repeatHeaderOnPageBreak', e.target.checked)} />
            Repetir cabeçalho em quebra de página
          </label>
        </div>
      );
    },
  },
  {
    id: 'frame',
    label: 'Quadro',
    icon: '🔲',
    description: 'Quadros com bordas completas (dados qualitativos)',
    schema: (s) => <TableSchema captionTemplate={s.frame.captionTemplate} label={s.frame.label} />,
    editor: (s, onChange) => {
      const frm = s.frame;
      function set<K extends keyof TableFormatState>(k: K, v: TableFormatState[K]) {
        onChange({ ...s, frame: { ...frm, [k]: v } });
      }
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Rótulo" value={frm.label} onChange={v => set('label', v)} />
            <LabeledSelect label="Numeração" value={frm.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
            <LabeledInput label="Template de legenda" value={frm.captionTemplate} onChange={v => set('captionTemplate', v)} />
            <LabeledInput label="Template de fonte" value={frm.sourceTemplate} onChange={v => set('sourceTemplate', v)} />
            <LabeledSelect label="Alinhamento" value={frm.alignment} options={ALIGN_OPTS} onChange={v => set('alignment', v)} />
            <LabeledNumber label="Largura (%)" value={frm.widthPercent} onChange={v => set('widthPercent', v)} step={5} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300"
              checked={frm.repeatHeaderOnPageBreak} onChange={e => set('repeatHeaderOnPageBreak', e.target.checked)} />
            Repetir cabeçalho em quebra de página
          </label>
        </div>
      );
    },
  },
  {
    id: 'chart',
    label: 'Gráfico',
    icon: '📈',
    description: 'Gráficos de barras, linhas, pizza e outros',
    schema: (s) => <FigureSchema captionTemplate={s.chart.captionTemplate} label={s.chart.label} />,
    editor: (s, onChange) => {
      const ch = s.chart;
      function set<K extends keyof ElementFormatState>(k: K, v: ElementFormatState[K]) {
        onChange({ ...s, chart: { ...ch, [k]: v } });
      }
      return (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput label="Rótulo" value={ch.label} onChange={v => set('label', v)} />
          <LabeledSelect label="Numeração" value={ch.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
          <LabeledInput label="Template de legenda" value={ch.captionTemplate} onChange={v => set('captionTemplate', v)} />
          <LabeledInput label="Template de fonte" value={ch.sourceTemplate} onChange={v => set('sourceTemplate', v)} />
          <LabeledSelect label="Alinhamento" value={ch.alignment} options={ALIGN_OPTS} onChange={v => set('alignment', v)} />
          <LabeledNumber label="Largura máx. (cm)" value={ch.maxWidthCm ?? 16} onChange={v => set('maxWidthCm', v)} />
        </div>
      );
    },
  },
  {
    id: 'equation',
    label: 'Equação',
    icon: '∑',
    description: 'Fórmulas e expressões matemáticas',
    schema: (s) => <EquationSchema numberingTemplate={s.equation.numberingTemplate} label={s.equation.label} />,
    editor: (s, onChange) => {
      const eq = s.equation;
      function set<K extends keyof EquationFormatState>(k: K, v: EquationFormatState[K]) {
        onChange({ ...s, equation: { ...eq, [k]: v } });
      }
      const numPreview = eq.numberingTemplate.replace('{num}', '3');
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">Prévia</div>
            <div className="flex items-center justify-between px-2">
              <div className="flex-1 text-center text-sm italic text-slate-700">E = mc²</div>
              <div className="text-[10px] text-slate-500">{numPreview}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Template de numeração" value={eq.numberingTemplate} onChange={v => set('numberingTemplate', v)} />
            <LabeledSelect label="Numeração" value={eq.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
            <LabeledSelect label="Alinhamento da equação" value={eq.alignment} options={ALIGN_OPTS} onChange={v => set('alignment', v)} />
            <LabeledInput label="Rótulo" value={eq.label} onChange={v => set('label', v)} />
          </div>
          <p className="text-[9px] text-slate-400">Variáveis: {'{num}'} = número sequencial</p>
        </div>
      );
    },
  },
  {
    id: 'codeListing',
    label: 'Listagem de Código',
    icon: '</> ',
    description: 'Trechos de código-fonte',
    schema: () => <CodeSchema />,
    editor: (s, onChange) => {
      const code = s.codeListing;
      function set<K extends keyof CodeFormatState>(k: K, v: CodeFormatState[K]) {
        onChange({ ...s, codeListing: { ...code, [k]: v } });
      }
      return (
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput label="Rótulo" value={code.label} onChange={v => set('label', v)} />
          <LabeledSelect label="Numeração" value={code.numberingStrategy} options={NUMBERING_OPTS} onChange={v => set('numberingStrategy', v)} />
          <LabeledInput label="Template de legenda" value={code.captionTemplate} onChange={v => set('captionTemplate', v)} />
          <LabeledInput label="Família de fonte" value={code.fontFamily} onChange={v => set('fontFamily', v)} />
          <LabeledNumber label="Tamanho (pt)" value={code.fontSizePt} onChange={v => set('fontSizePt', v)} step={0.5} />
          <LabeledNumber label="Largura (%)" value={code.widthPercent} onChange={v => set('widthPercent', v)} step={5} />
        </div>
      );
    },
  },
  {
    id: 'directCitation',
    label: 'Citação Direta Curta',
    icon: '"…"',
    description: 'Citações de até 3 linhas — inseridas no corpo do parágrafo entre aspas',
    schema: (s) => <DirectCitationSchema state={s.directCitation} />,
    editor: (s, onChange) => {
      const dc = s.directCitation;
      function set<K extends keyof DirectCitationState>(k: K, v: DirectCitationState[K]) {
        onChange({ ...s, directCitation: { ...dc, [k]: v } });
      }
      const preview = `...texto ${dc.openQuote}trecho citado diretamente${dc.closeQuote} (AUTOR, 2024, p. 10) texto...`;
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Prévia</div>
            <div className="text-[10px] text-slate-600 leading-relaxed">{preview}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Aspas de abertura" value={dc.openQuote} onChange={v => set('openQuote', v)} />
            <LabeledInput label="Aspas de fechamento" value={dc.closeQuote} onChange={v => set('closeQuote', v)} />
          </div>
        </div>
      );
    },
  },
  {
    id: 'longDirectCitation',
    label: 'Citação Direta Longa',
    icon: '⸢⸣',
    description: 'Citações com mais de 3 linhas — recuadas, fonte menor',
    schema: (s) => <LongDirectCitationSchema state={s.longDirectCitation} />,
    editor: (s, onChange) => {
      const ldc = s.longDirectCitation;
      function set<K extends keyof LongDirectCitationState>(k: K, v: LongDirectCitationState[K]) {
        onChange({ ...s, longDirectCitation: { ...ldc, [k]: v } });
      }
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">Prévia</div>
            <div className="text-slate-600 leading-relaxed"
              style={{
                marginLeft: `${ldc.leftIndentCm * 8}px`,
                fontSize: `${Math.min(ldc.fontSizePt, 11)}px`,
                lineHeight: ldc.lineSpacing,
              }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. (AUTOR, 2024, p. 45)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledNumber label="Recuo esquerdo (cm)" value={ldc.leftIndentCm} onChange={v => set('leftIndentCm', v)} />
            <LabeledNumber label="Recuo direito (cm)" value={ldc.rightIndentCm} onChange={v => set('rightIndentCm', v)} />
            <LabeledNumber label="Tamanho da fonte (pt)" value={ldc.fontSizePt} onChange={v => set('fontSizePt', v)} step={0.5} />
            <LabeledNumber label="Espaçamento" value={ldc.lineSpacing} onChange={v => set('lineSpacing', v)} step={0.25} />
            <LabeledNumber label="Espaço antes (pt)" value={ldc.spaceBeforePt} onChange={v => set('spaceBeforePt', v)} />
            <LabeledNumber label="Espaço depois (pt)" value={ldc.spaceAfterPt} onChange={v => set('spaceAfterPt', v)} />
          </div>
        </div>
      );
    },
  },
  {
    id: 'indirectCitation',
    label: 'Citação Indireta',
    icon: '(…)',
    description: 'Paráfrase — sem aspas, com referência parentética',
    schema: () => (
      <div className="text-[10px] text-slate-600 leading-relaxed text-left">
        ...de acordo com as pesquisas da área (SILVA, 2024), os resultados demonstram que a hipótese inicial foi confirmada...
      </div>
    ),
    editor: (s, onChange) => {
      const cf = s.citationFormatting;
      function setCf<K extends keyof typeof cf>(k: K, v: typeof cf[K]) {
        onChange({ ...s, citationFormatting: { ...cf, [k]: v } });
      }
      const preview = `${cf.parenOpen}SILVA${cf.authorYearSeparator}2024${cf.parenClose}`;
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Exemplo de referência</div>
            <div className="text-sm font-mono text-slate-700">{preview}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledInput label="Parêntese abre" value={cf.parenOpen} onChange={v => setCf('parenOpen', v)} />
            <LabeledInput label="Parêntese fecha" value={cf.parenClose} onChange={v => setCf('parenClose', v)} />
            <LabeledInput label="Separador Autor/Ano" value={cf.authorYearSeparator} onChange={v => setCf('authorYearSeparator', v)} />
            <LabeledInput label="Separador multi-autor" value={cf.multiAuthorJoiner} onChange={v => setCf('multiAuthorJoiner', v)} />
            <LabeledInput label="Et al." value={cf.etAl} onChange={v => setCf('etAl', v)} />
            <LabeledInput label="Prefixo de página" value={cf.pagePrefix} onChange={v => setCf('pagePrefix', v)} />
            <LabeledInput label="Conector apud" value={cf.apudConnector} onChange={v => setCf('apudConnector', v)} />
            <LabeledInput label="Grifo nosso" value={cf.emphasisOursLabel} onChange={v => setCf('emphasisOursLabel', v)} />
          </div>
        </div>
      );
    },
  },
  {
    id: 'footnote',
    label: 'Nota de Rodapé',
    icon: '¹',
    description: 'Notas numeradas na parte inferior da página',
    schema: (s) => <FootnoteSchema state={s.footnote} />,
    editor: (s, onChange) => {
      const fn = s.footnote;
      function set<K extends keyof FootnoteState>(k: K, v: FootnoteState[K]) {
        onChange({ ...s, footnote: { ...fn, [k]: v } });
      }
      return (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-left space-y-1">
            <div className="text-[9px] text-slate-400 uppercase font-bold mb-2">Prévia</div>
            <div className="text-[10px] text-slate-600">...parágrafo com nota¹ no rodapé da página.</div>
            <div className="border-t border-slate-400 pt-1" style={{ width: `${fn.separatorWidthPct}%` }}>
              <div style={{ fontSize: `${Math.min(fn.fontSizePt, 10)}px` }} className="text-slate-500">
                ¹ Texto da nota de rodapé explicando o assunto.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabeledNumber label="Tamanho da fonte (pt)" value={fn.fontSizePt} onChange={v => set('fontSizePt', v)} step={0.5} />
            <LabeledNumber label="Espaçamento" value={fn.lineSpacing} onChange={v => set('lineSpacing', v)} step={0.25} />
            <LabeledNumber label="Recuo primeira linha (cm)" value={fn.firstLineIndentCm} onChange={v => set('firstLineIndentCm', v)} />
            <LabeledNumber label="Largura do separador (%)" value={fn.separatorWidthPct} onChange={v => set('separatorWidthPct', v)} step={5} min={10} />
          </div>
        </div>
      );
    },
  },
];

function ElementCard({ card, state, onChange }: { card: CardDef; state: BodyContentState; onChange: (s: BodyContentState) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${expanded ? 'border-blue-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${expanded ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
      >
        <span className="text-lg shrink-0 w-7 text-center" aria-hidden>{card.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{card.label}</p>
          <p className="text-[10px] text-slate-400 truncate">{card.description}</p>
        </div>
        <span className={`text-slate-400 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Miniatura */}
            <div className="p-4 flex items-center justify-center bg-white min-h-[100px]">
              {card.schema(state)}
            </div>
            {/* Configuração */}
            <div className="p-4 bg-slate-50">
              {card.editor(state, onChange)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TextualElementsGallery({ state, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 mb-4">
        Configure como cada tipo de elemento deve ser formatado quando inserido no trabalho. Clique em um tipo para ver a prévia e editar as configurações.
      </p>
      {CARDS.map(card => (
        <ElementCard key={card.id} card={card} state={state} onChange={onChange} />
      ))}
    </div>
  );
}
