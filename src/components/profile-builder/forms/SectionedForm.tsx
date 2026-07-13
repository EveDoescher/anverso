'use client';

import { ComponentState, StyleRule } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
  bodyContentIds: string[];
  styleRules: StyleRule[];
}

export function SectionedForm({ comp, onChange, bodyContentIds, styleRules }: Props) {
  const preview = (comp.headingTemplate ?? '{letter} — {title}')
    .replace('{letter}', 'A')
    .replace('{number}', '1')
    .replace('{title}', 'Meu Apêndice');

  const styleIds = styleRules.map(r => r.id);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">ID do componente</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
          value={comp.id} onChange={e => onChange({ ...comp, id: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Template do título
        </label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingTemplate ?? '{letter} — {title}'}
          onChange={e => onChange({ ...comp, headingTemplate: e.target.value })} />
        <p className="text-[10px] text-slate-400 mt-0.5">Variáveis: {'{letter}'}, {'{number}'}, {'{title}'}</p>
        <div className="mt-1 px-3 py-1.5 bg-slate-100 rounded text-xs text-slate-700 font-medium">
          Preview: {preview}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Estilo de indexação</label>
        <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.indexingStyle ?? 'ALPHABETIC'}
          onChange={e => onChange({ ...comp, indexingStyle: e.target.value as 'ALPHABETIC' | 'NUMERIC' })}>
          <option value="ALPHABETIC">Alfabético (A, B, C...)</option>
          <option value="NUMERIC">Numérico (1, 2, 3...)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Estilo de parágrafo</label>
        <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.paragraphStyleId ?? ''}
          onChange={e => onChange({ ...comp, paragraphStyleId: e.target.value || undefined })}>
          <option value="">— Selecione —</option>
          {styleIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>

      {bodyContentIds.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Componente de corpo vinculado</label>
          <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
            value={comp.bodyContentComponentId ?? ''}
            onChange={e => onChange({ ...comp, bodyContentComponentId: e.target.value })}>
            <option value="">— Nenhum —</option>
            {bodyContentIds.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
