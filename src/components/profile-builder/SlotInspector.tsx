'use client';

import { ComponentState, SlotState, SlotType, StyleRule, defaultStyleRule } from '@/lib/profileSerializer';
import { StyleRuleEditor } from './StyleRuleEditor';
import { useEffect } from 'react';

interface Props {
  component: ComponentState;
  slot: SlotState;
  styleRules: StyleRule[];
  onUpdateSlot: (updated: SlotState) => void;
  onAddStyleRule: (rule: StyleRule) => void;
}

const FIELD_TYPES: { value: SlotType; label: string; description: string }[] = [
  { value: 'TEXT', label: 'Linha de texto', description: 'Uma única linha — ideal para título, autor, cidade...' },
  { value: 'TEXT_LIST', label: 'Texto longo', description: 'Múltiplos parágrafos — ideal para resumos, declarações...' },
  { value: 'COMPOSED_TEXT', label: 'Texto gerado', description: 'Montado automaticamente a partir de variáveis definidas' },
  { value: 'SIGNATURE_BLOCK_LIST', label: 'Bloco de assinaturas', description: 'Lista de pessoas com nome, cargo e linha de assinatura' },
];

const PLACEMENTS: { value: SlotState['horizontalPlacement']; label: string }[] = [
  { value: 'FULL_CONTENT_WIDTH', label: 'Ocupa toda a largura da página' },
  { value: 'FROM_PAGE_CENTER_TO_RIGHT_MARGIN', label: 'Metade direita da página (epígrafe, nota...)' },
  { value: 'CUSTOM', label: 'Recuo personalizado' },
];

export function SlotInspector({ component, slot, styleRules, onUpdateSlot, onAddStyleRule }: Props) {
  function set<K extends keyof SlotState>(key: K, value: SlotState[K]) {
    onUpdateSlot({ ...slot, [key]: value });
  }

  const internalId = slot.styleId ?? `${component.id}.${slot.id}`;
  const assignedRule = styleRules.find(r => r.id === internalId);

  // Garante que a style rule existe assim que o campo é aberto
  useEffect(() => {
    if (!assignedRule) {
      const newRule = defaultStyleRule(internalId);
      onAddStyleRule(newRule);
      onUpdateSlot({ ...slot, styleId: internalId });
    }
  // Só roda quando muda de campo — não reage a mudanças do slot em si
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalId]);

  const rule = assignedRule ?? defaultStyleRule(internalId);

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-100 pb-2">
        <p className="text-sm font-bold text-slate-800">{slot.displayName || slot.id}</p>
        <p className="text-xs text-slate-400">Campo de conteúdo</p>
      </div>

      {/* Nome visível */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do campo</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
          value={slot.displayName || ''}
          onChange={e => set('displayName', e.target.value)}
          placeholder="Ex: Título principal, Autor..."
        />
      </div>

      {/* Tipo de conteúdo */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de conteúdo</label>
        <div className="space-y-1.5">
          {FIELD_TYPES.map(ft => (
            <label
              key={ft.value}
              className={`flex items-start gap-3 p-2.5 border rounded-lg cursor-pointer transition ${
                slot.type === ft.value
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={`type-${slot.id}`}
                className="mt-0.5 text-indigo-600"
                checked={slot.type === ft.value}
                onChange={() => set('type', ft.value)}
              />
              <div>
                <p className="text-sm font-medium text-slate-800">{ft.label}</p>
                <p className="text-xs text-slate-400">{ft.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Obrigatório */}
      <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
        <input
          type="checkbox"
          className="w-4 h-4 text-indigo-600 rounded border-slate-300"
          checked={slot.required}
          onChange={e => set('required', e.target.checked)}
        />
        <div>
          <p className="text-sm font-medium text-slate-700">Campo obrigatório</p>
          <p className="text-xs text-slate-400">O usuário não pode deixar em branco</p>
        </div>
      </label>

      {/* COMPOSED_TEXT */}
      {slot.type === 'COMPOSED_TEXT' && (
        <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-800">Texto gerado automaticamente</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Modelo de texto</label>
            <input
              type="text"
              className="w-full border border-amber-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400"
              placeholder="Ex: {cidade}, {estado} – {ano}"
              value={slot.template ?? ''}
              onChange={e => set('template', e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Use {'{'} {'}'} para marcar onde cada informação será inserida</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Informações necessárias</label>
            <input
              type="text"
              className="w-full border border-amber-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400"
              placeholder="cidade, estado, ano"
              value={(slot.fieldNames ?? []).join(', ')}
              onChange={e => set('fieldNames', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
            <p className="text-xs text-slate-400 mt-1">Separe com vírgula. Devem corresponder ao que está no modelo.</p>
          </div>
        </div>
      )}

      {/* SIGNATURE_BLOCK_LIST */}
      {slot.type === 'SIGNATURE_BLOCK_LIST' && (
        <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-bold text-purple-800">Blocos de assinatura</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-600 rounded border-slate-300"
              checked={slot.signatureLineEnabled ?? true}
              onChange={e => set('signatureLineEnabled', e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">Mostrar linha de assinatura</span>
          </label>
          {slot.signatureLineEnabled !== false && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Aparência da linha</label>
              <input
                type="text"
                className="w-full border border-purple-200 rounded-lg p-2.5 text-sm"
                value={slot.signatureLineText ?? '________________________________________'}
                onChange={e => set('signatureLineText', e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Linhas de informação por pessoa</label>
            <p className="text-xs text-slate-400 mb-1">Uma por linha. Use {'{'} nome {'}'}, {'{'} cargo {'}'}, {'{'} instituição {'}'} etc.</p>
            <textarea
              className="w-full border border-purple-200 rounded-lg p-2.5 text-sm"
              rows={3}
              value={(slot.lineTemplates ?? []).join('\n')}
              onChange={e => set('lineTemplates', e.target.value.split('\n'))}
            />
          </div>
        </div>
      )}

      {/* SIGNATURE_BLOCK_LIST — knownFieldNames */}
      {slot.type === 'SIGNATURE_BLOCK_LIST' && (
        <div className="space-y-2 p-3 bg-violet-50 border border-violet-200 rounded-lg">
          <p className="text-xs font-bold text-violet-800">Campos reconhecidos pelo Formatter</p>
          <p className="text-[10px] text-slate-500">Um por linha. Ex: name, title, institutionName, role</p>
          <textarea
            className="w-full border border-violet-200 rounded-lg p-2 text-xs"
            rows={3}
            value={(slot.knownFieldNames ?? []).join('\n')}
            onChange={e => set('knownFieldNames', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
          />
        </div>
      )}

      {/* groupId — só para SINGLE_PAGE */}
      {component.ruleType === 'SINGLE_PAGE' && (
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Agrupar com outros campos</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
            value={slot.groupId ?? ''}
            onChange={e => set('groupId', e.target.value.trim().toLowerCase().replace(/\s+/g, '-') || undefined)}
            placeholder="Ex: bloco-titulo"
          />
          <p className="text-xs text-slate-400 mt-0.5">Campos com o mesmo nome de grupo ficam colados verticalmente, sem espaço entre eles</p>
        </div>
      )}

      {/* Posicionamento (apenas SINGLE_PAGE) */}
      {component.ruleType === 'SINGLE_PAGE' && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-700">Posição na página</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Largura ocupada</label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              value={slot.horizontalPlacement ?? 'FULL_CONTENT_WIDTH'}
              onChange={e => set('horizontalPlacement', e.target.value as SlotState['horizontalPlacement'])}
            >
              {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {slot.horizontalPlacement === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recuo esquerda (cm)</label>
                <input type="number" step="0.5" min="0" className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  value={slot.customLeftMarginCm ?? 0}
                  onChange={e => set('customLeftMarginCm', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recuo direita (cm)</label>
                <input type="number" step="0.5" min="0" className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  value={slot.customRightMarginCm ?? 0}
                  onChange={e => set('customRightMarginCm', Number(e.target.value))} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Linhas em branco após</label>
              <input type="number" min="0" className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                value={slot.blankLinesAfter ?? 0}
                onChange={e => set('blankLinesAfter', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Espaço flexível abaixo</label>
              <input type="number" min="0" max="100" className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                value={slot.gapWeight ?? 10}
                onChange={e => set('gapWeight', parseInt(e.target.value))} />
              <p className="text-[10px] text-slate-400 mt-0.5">1–100, valores maiores afastam mais</p>
            </div>
          </div>
        </div>
      )}

      {/* Aparência tipográfica — sempre visível */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-700">Aparência tipográfica</p>
        <StyleRuleEditor rule={rule} onChange={updated => onAddStyleRule(updated)} />
      </div>
    </div>
  );
}
