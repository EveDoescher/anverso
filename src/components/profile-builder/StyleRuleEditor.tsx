'use client';

import { StyleRule, displayNameToStyleId, styleIdToDisplayName } from '@/lib/profileSerializer';

interface StyleRuleEditorProps {
  rule: StyleRule;
  onChange: (updated: StyleRule) => void;
}

const FONT_FAMILIES = ['Times New Roman', 'Arial', 'Calibri', 'Courier New', 'Georgia', 'Verdana'];

const ALIGNMENTS: { value: StyleRule['alignment']; label: string }[] = [
  { value: 'JUSTIFIED', label: 'Justificado' },
  { value: 'LEFT', label: 'Esquerda' },
  { value: 'CENTER', label: 'Centralizado' },
  { value: 'RIGHT', label: 'Direita' },
];

const RULE_TYPES: { value: StyleRule['type']; label: string }[] = [
  { value: 'PARAGRAPH', label: 'Parágrafo' },
  { value: 'HEADING_1', label: 'Título Nível 1' },
  { value: 'HEADING_2', label: 'Título Nível 2' },
  { value: 'HEADING_3', label: 'Título Nível 3' },
  { value: 'HEADING_4', label: 'Título Nível 4' },
  { value: 'HEADING_5', label: 'Título Nível 5' },
  { value: 'HEADING_6', label: 'Título Nível 6' },
  { value: 'CHARACTER', label: 'Caractere (inline)' },
];

function field(label: string, children: React.ReactNode, hint?: string) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export function StyleRuleEditor({ rule, onChange }: StyleRuleEditorProps) {
  function set<K extends keyof StyleRule>(key: K, value: StyleRule[K]) {
    onChange({ ...rule, [key]: value });
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        {field('Nome do estilo',
          <input
            type="text"
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
            value={rule.displayName ?? styleIdToDisplayName(rule.id)}
            onChange={e => {
              const name = e.target.value;
              onChange({ ...rule, displayName: name, id: displayNameToStyleId(name) || rule.id });
            }}
          />,
          'Ex: Título da Capa, Parágrafo Normal'
        )}
        {field('Tipo',
          <select
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.type}
            onChange={e => set('type', e.target.value as StyleRule['type'])}
          >
            {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Família de fonte',
          <select
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.fontFamily}
            onChange={e => set('fontFamily', e.target.value)}
          >
            {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {field('Tamanho (pt)',
          <input
            type="number"
            step="0.5"
            min="6"
            max="72"
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
            value={rule.fontSizePt}
            onChange={e => set('fontSizePt', Number(e.target.value))}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Alinhamento',
          <select
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.alignment}
            onChange={e => set('alignment', e.target.value as StyleRule['alignment'])}
          >
            {ALIGNMENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        )}
        {field('Espaçamento de linha',
          <select
            className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.lineSpacing}
            onChange={e => set('lineSpacing', Number(e.target.value))}
          >
            <option value={1.0}>Simples (1.0)</option>
            <option value={1.15}>1.15</option>
            <option value={1.5}>1.5</option>
            <option value={2.0}>Duplo (2.0)</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {field('Recuo 1ª linha (cm)',
          <input type="number" step="0.1" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.firstLineIndentCm} onChange={e => set('firstLineIndentCm', Number(e.target.value))} />
        )}
        {field('Recuo esq. (cm)',
          <input type="number" step="0.1" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.leftIndentCm} onChange={e => set('leftIndentCm', Number(e.target.value))} />
        )}
        {field('Recuo dir. (cm)',
          <input type="number" step="0.1" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.rightIndentCm} onChange={e => set('rightIndentCm', Number(e.target.value))} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Espaç. antes (pt)',
          <input type="number" step="1" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.spacingBeforePt} onChange={e => set('spacingBeforePt', Number(e.target.value))} />
        )}
        {field('Espaç. depois (pt)',
          <input type="number" step="1" min="0" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.spacingAfterPt} onChange={e => set('spacingAfterPt', Number(e.target.value))} />
        )}
      </div>

      <div className="flex gap-6 p-3 bg-white border border-slate-200 rounded-lg">
        {[
          { key: 'bold' as const, label: 'Negrito', display: 'B', extraClass: 'font-bold' },
          { key: 'italic' as const, label: 'Itálico', display: 'I', extraClass: 'italic font-serif' },
          { key: 'uppercase' as const, label: 'Maiúsculas', display: 'AA', extraClass: 'font-bold text-[10px]' },
        ].map(({ key, label, display, extraClass }) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rule[key]}
              onChange={e => set(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className={`text-sm text-slate-700 ${extraClass}`}>{display}</span>
            <span className="text-[10px] text-slate-400">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
