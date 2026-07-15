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
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Título da página</label>
        <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingText ?? 'SUMÁRIO'}
          onChange={e => onChange({ ...comp, headingText: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Corpo do texto de origem</label>
        <select className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.sourceComponentId ?? ''}
          onChange={e => onChange({ ...comp, sourceComponentId: e.target.value || undefined })}>
          <option value="">— Selecione —</option>
          {bodyContentComponents.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
        </select>
        <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">Seção do documento de onde os títulos de capítulos serão coletados</p>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[var(--color-neutral)] mb-0.5">Estilo do título da página</label>
        <select className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.headingStyleId ?? ''}
          onChange={e => onChange({ ...comp, headingStyleId: e.target.value || undefined })}>
          <option value="">(usar padrão automático)</option>
          {styleRules.map(r => <option key={r.id} value={r.id}>{r.displayName || r.id}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Template de entrada</label>
        <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={entryTemplate}
          onChange={e => onChange({ ...comp, entryTemplate: e.target.value })} />
        <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">
          Variáveis: <code>{'{number}'}</code>, <code>{'{title}'}</code>, <code>{'{page}'}</code>
        </p>
        <div className="mt-1.5 border border-[var(--color-border-soft)] rounded-lg overflow-hidden bg-white">
          <div className="px-3 py-1.5 bg-[var(--color-paper)] border-b border-[var(--color-border-soft)]">
            <span className="text-[9px] font-bold text-[var(--color-neutral)]/70 uppercase">Prévia</span>
          </div>
          <div className="px-3 py-2 space-y-1.5 font-serif">
            {LEVEL_SAMPLES.map(level => (
              <div
                key={level.level}
                className="text-xs text-[var(--color-espresso)]"
                style={{ paddingLeft: `${(level.level - 1) * 12}px` }}
              >
                {renderLevelPreview(level)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Linhas em branco após título</label>
        <input type="number" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.blankLinesAfterHeading ?? 1}
          onChange={e => onChange({ ...comp, blankLinesAfterHeading: parseInt(e.target.value) })} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)]"
          checked={comp.useTocField ?? true}
          onChange={e => onChange({ ...comp, useTocField: e.target.checked })} />
        <div>
          <p className="text-xs font-medium text-[var(--color-espresso)]">Sumário clicável</p>
          <p className="text-[10px] text-[var(--color-neutral)]/70">Gera links que navegam direto para cada seção no Word</p>
        </div>
      </label>
    </div>
  );
}
