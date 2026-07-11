'use client';

import { ComponentState } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
}

const ELEMENT_TYPES: { value: NonNullable<ComponentState['elementType']>; label: string }[] = [
  { value: 'FIGURE', label: 'Figuras' },
  { value: 'TABLE', label: 'Tabelas' },
  { value: 'FRAME', label: 'Quadros' },
  { value: 'CHART', label: 'Gráficos' },
  { value: 'CODE_LISTING', label: 'Listagens de Código' },
];

export function ElementIndexForm({ comp, onChange }: Props) {
  const template = comp.entryTemplate ?? '{number} — {caption}';
  const entryPreview = template
    .replace('{number}', '1')
    .replace('{caption}', 'Mapa das regiões do Brasil')
    .replace('{page}', '42');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de elemento</label>
        <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.elementType ?? 'FIGURE'}
          onChange={e => onChange({ ...comp, elementType: e.target.value as NonNullable<ComponentState['elementType']> })}>
          {ELEMENT_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Título da página</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingText ?? 'LISTA'}
          onChange={e => onChange({ ...comp, headingText: e.target.value })} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Template da entrada</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={template}
          onChange={e => onChange({ ...comp, entryTemplate: e.target.value })} />
        <p className="text-[10px] text-slate-400 mt-0.5">Variáveis: <code>{'{number}'}</code>, <code>{'{caption}'}</code>, <code>{'{page}'}</code></p>
        <div className="mt-1.5 px-3 py-2 bg-slate-100 rounded text-xs text-slate-700 font-serif">
          {entryPreview}
          {template.includes('{page}') && <span className="text-slate-400">.......... 42</span>}
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
          checked={comp.pageReferenceEnabled ?? true}
          onChange={e => onChange({ ...comp, pageReferenceEnabled: e.target.checked })} />
        <span className="text-xs font-medium text-slate-700">Incluir referência de página</span>
      </label>
    </div>
  );
}
