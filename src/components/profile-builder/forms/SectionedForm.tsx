'use client';

import { ComponentState, StyleRule } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
  allComponents: ComponentState[];
  styleRules: StyleRule[];
}

export function SectionedForm({ comp, onChange, allComponents, styleRules }: Props) {
  const preview = (comp.headingTemplate ?? '{letter} — {title}')
    .replace('{letter}', 'A')
    .replace('{number}', '1')
    .replace('{title}', 'Meu Apêndice');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">
          Template do título
        </label>
        <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingTemplate ?? '{letter} — {title}'}
          onChange={e => onChange({ ...comp, headingTemplate: e.target.value })} />
        <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">Variáveis: {'{letter}'}, {'{number}'}, {'{title}'}</p>
        <div className="mt-1 px-3 py-1.5 bg-[var(--color-paper-soft)] rounded text-xs text-[var(--color-espresso)] font-medium">
          Preview: {preview}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Estilo de indexação</label>
        <select className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.indexingStyle ?? 'ALPHABETIC'}
          onChange={e => onChange({ ...comp, indexingStyle: e.target.value as 'ALPHABETIC' | 'NUMERIC' })}>
          <option value="ALPHABETIC">Alfabético (A, B, C...)</option>
          <option value="NUMERIC">Numérico (1, 2, 3...)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Estilo de parágrafo</label>
        <select className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.paragraphStyleId ?? ''}
          onChange={e => onChange({ ...comp, paragraphStyleId: e.target.value || undefined })}>
          <option value="">— Selecione —</option>
          {styleRules.map(r => <option key={r.id} value={r.id}>{r.displayName || r.id}</option>)}
        </select>
      </div>

      {allComponents.some(c => c.ruleType === 'BODY_CONTENT') && (
        <div>
          <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Corpo do texto vinculado</label>
          <select className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            value={comp.bodyContentComponentId ?? ''}
            onChange={e => onChange({ ...comp, bodyContentComponentId: e.target.value })}>
            <option value="">— Nenhum —</option>
            {allComponents
              .filter(c => c.ruleType === 'BODY_CONTENT')
              .map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
