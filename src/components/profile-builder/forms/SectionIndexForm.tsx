'use client';

import { ComponentState, StyleRule } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
  styleRules: StyleRule[];
  allComponents: ComponentState[];
}

const LEVEL_SAMPLES = [
  { level: 1, number: '1', title: 'INTRODUÇÃO' },
  { level: 2, number: '1.1', title: 'Fundamentação Teórica' },
  { level: 3, number: '1.1.1', title: 'Contexto histórico' },
];

const DEFAULT_ENTRY_TEMPLATE = '{number}  {title} ......... {page}';

export function SectionIndexForm({ comp, onChange, styleRules, allComponents }: Props) {
  const entryTemplate = comp.entryTemplate ?? DEFAULT_ENTRY_TEMPLATE;
  const styleIds = styleRules.map(r => r.id);
  const bodyContentComponents = allComponents.filter(c => c.ruleType === 'BODY_CONTENT');

  function renderLevelPreview(level: typeof LEVEL_SAMPLES[0]): string {
    return entryTemplate
      .replace('{number}', level.number)
      .replace('{title}', level.title)
      .replace('{page}', String(10 + level.level * 7));
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Título da página</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingText ?? 'SUMÁRIO'}
          onChange={e => onChange({ ...comp, headingText: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Componente de origem</label>
        <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.sourceComponentId ?? ''}
          onChange={e => onChange({ ...comp, sourceComponentId: e.target.value || undefined })}>
          <option value="">— Selecione o corpo do texto —</option>
          {bodyContentComponents.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
        </select>
        <p className="text-[10px] text-slate-400 mt-0.5">O componente BODY_CONTENT de onde as seções serão coletadas</p>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Estilo do título</label>
        <select className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.headingStyleId ?? ''}
          onChange={e => onChange({ ...comp, headingStyleId: e.target.value || undefined })}>
          <option value="">(padrão: {comp.id}.heading)</option>
          {styleIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Template de entrada</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={entryTemplate}
          onChange={e => onChange({ ...comp, entryTemplate: e.target.value })} />
        <p className="text-[10px] text-slate-400 mt-0.5">
          Variáveis: <code>{'{number}'}</code>, <code>{'{title}'}</code>, <code>{'{page}'}</code>
        </p>
        <div className="mt-1.5 border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Prévia</span>
          </div>
          <div className="px-3 py-2 space-y-1.5 font-serif">
            {LEVEL_SAMPLES.map(level => (
              <div
                key={level.level}
                className="text-xs text-slate-700"
                style={{ paddingLeft: `${(level.level - 1) * 12}px` }}
              >
                {renderLevelPreview(level)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Linhas em branco após título</label>
        <input type="number" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.blankLinesAfterHeading ?? 1}
          onChange={e => onChange({ ...comp, blankLinesAfterHeading: parseInt(e.target.value) })} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300"
          checked={comp.useTocField ?? true}
          onChange={e => onChange({ ...comp, useTocField: e.target.checked })} />
        <span className="text-xs font-medium text-slate-700">Usar campo TOC automático do Word</span>
      </label>
    </div>
  );
}
