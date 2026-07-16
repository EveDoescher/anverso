'use client';

import { StyleRule } from '@/lib/profileSerializer';

interface StyleRuleEditorProps {
  rule: StyleRule;
  onChange: (updated: StyleRule) => void;
  hideNameField?: boolean;
  baseFont?: string;
}

const FONT_FAMILIES = ['Times New Roman', 'Arial', 'Calibri', 'Courier New', 'Georgia', 'Verdana'];
const DEFAULT_FONT_VALUE = '__default__';

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
      <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">{hint}</p>}
    </div>
  );
}

export function StyleRuleEditor({ rule, onChange, hideNameField, baseFont }: StyleRuleEditorProps) {
  function set<K extends keyof StyleRule>(key: K, value: StyleRule[K]) {
    onChange({ ...rule, [key]: value });
  }

  const isDefaultFont = !rule.fontFamily || rule.fontFamily === DEFAULT_FONT_VALUE;
  const fontSelectValue = isDefaultFont ? DEFAULT_FONT_VALUE : rule.fontFamily;

  function handleFontChange(value: string) {
    if (value === DEFAULT_FONT_VALUE) {
      onChange({ ...rule, fontFamily: DEFAULT_FONT_VALUE });
    } else {
      set('fontFamily', value);
    }
  }

  return (
    <div className="space-y-4 p-4 bg-[var(--color-paper)] border border-[var(--color-border-soft)] rounded-lg">
      <div className={hideNameField ? '' : 'grid grid-cols-2 gap-3'}>
        {!hideNameField && field('Nome do estilo',
          <input
            type="text"
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500"
            value={rule.displayName ?? rule.id}
            onChange={e => {
              onChange({ ...rule, displayName: e.target.value });
            }}
          />,
          'Ex: Título da Capa, Parágrafo Normal'
        )}
        {field('Tipo',
          <select
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.type}
            onChange={e => set('type', e.target.value as StyleRule['type'])}
          >
            {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Fonte',
          <select
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] bg-white focus:ring-2 focus:ring-blue-500"
            value={fontSelectValue}
            onChange={e => handleFontChange(e.target.value)}
          >
            <option value={DEFAULT_FONT_VALUE}>
              {baseFont ? `Padrão (${baseFont})` : 'Padrão (definida na página)'}
            </option>
            {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {field('Tamanho (pt)',
          <input
            type="number"
            step="0.5"
            min="6"
            max="72"
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500"
            value={rule.fontSizePt}
            onChange={e => set('fontSizePt', Number(e.target.value))}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Alinhamento',
          <select
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] bg-white focus:ring-2 focus:ring-blue-500"
            value={rule.alignment}
            onChange={e => set('alignment', e.target.value as StyleRule['alignment'])}
          >
            {ALIGNMENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        )}
        {field('Espaçamento de linha',
          <select
            className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] bg-white focus:ring-2 focus:ring-blue-500"
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
          <input type="number" step="0.1" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.firstLineIndentCm} onChange={e => set('firstLineIndentCm', Number(e.target.value))} />
        )}
        {field('Recuo esq. (cm)',
          <input type="number" step="0.1" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.leftIndentCm} onChange={e => set('leftIndentCm', Number(e.target.value))} />
        )}
        {field('Recuo dir. (cm)',
          <input type="number" step="0.1" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.rightIndentCm} onChange={e => set('rightIndentCm', Number(e.target.value))} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Espaç. antes (pt)',
          <input type="number" step="1" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.spacingBeforePt} onChange={e => set('spacingBeforePt', Number(e.target.value))} />
        )}
        {field('Espaç. depois (pt)',
          <input type="number" step="1" min="0" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
            value={rule.spacingAfterPt} onChange={e => set('spacingAfterPt', Number(e.target.value))} />
        )}
      </div>

      <div className="flex gap-6 p-3 bg-white border border-[var(--color-border-soft)] rounded-lg">
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
              className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)] focus:ring-blue-500"
            />
            <span className={`text-sm text-[var(--color-espresso)] ${extraClass}`}>{display}</span>
            <span className="text-[10px] text-[var(--color-neutral)]/70">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
