'use client';

import { ComponentState, SlotState, SlotType, StyleRule, defaultStyleRule } from '@/lib/profileSerializer';
import { StyleRuleEditor } from './StyleRuleEditor';
import { useEffect } from 'react';
import { Button } from '../ui/Button';

interface Props {
  component: ComponentState;
  slot: SlotState;
  styleRules: StyleRule[];
  allSlots: SlotState[];
  onUpdateSlot: (updated: SlotState) => void;
  onAddStyleRule: (rule: StyleRule) => void;
  baseFont?: string;
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

export function SlotInspector({ component, slot, styleRules, allSlots, onUpdateSlot, onAddStyleRule, baseFont }: Props) {
  function set<K extends keyof SlotState>(key: K, value: SlotState[K]) {
    onUpdateSlot({ ...slot, [key]: value });
  }

  const internalId = slot.styleId ?? `${component.id}.${slot.id}`;
  const assignedRule = styleRules.find(r => r.id === internalId);

  useEffect(() => {
    if (!assignedRule) {
      const newRule = defaultStyleRule(internalId);
      onAddStyleRule(newRule);
      onUpdateSlot({ ...slot, styleId: internalId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalId]);

  const rule = assignedRule ?? defaultStyleRule(internalId);

  // Slots disponíveis para agrupamento (todos do componente, exceto o atual)
  const otherSlots = allSlots.filter(s => s.id !== slot.id);

  // Descobre os agrupamentos existentes: mapa groupId → nomes dos slots
  const groupMap: Record<string, string[]> = {};
  for (const s of allSlots) {
    if (s.groupId) {
      if (!groupMap[s.groupId]) groupMap[s.groupId] = [];
      groupMap[s.groupId].push(s.displayName || s.id);
    }
  }

  // Slots que já estão no mesmo grupo que este slot
  const currentGroupMembers = slot.groupId
    ? allSlots.filter(s => s.groupId === slot.groupId && s.id !== slot.id)
    : [];

  function toggleGroup(targetSlot: SlotState) {
    const sameGroup = targetSlot.groupId && targetSlot.groupId === slot.groupId;
    if (sameGroup) {
      // Remove this slot from the group
      const remainingInGroup = allSlots.filter(s => s.groupId === slot.groupId && s.id !== slot.id && s.id !== targetSlot.id);
      const newGroupId = remainingInGroup.length === 0 ? undefined : slot.groupId;
      onUpdateSlot({ ...slot, groupId: newGroupId });
    } else if (targetSlot.groupId) {
      // Join target's existing group
      onUpdateSlot({ ...slot, groupId: targetSlot.groupId });
    } else {
      // Create a new group between these two slots
      const newGroupId = `${component.id}.grp.${slot.id}.${targetSlot.id}`;
      onUpdateSlot({ ...slot, groupId: newGroupId });
      // We need to also update the target slot — signal via a synthetic callback
      // Since we only have onUpdateSlot for *this* slot, we use a side-effect:
      // The parent will need to handle multi-slot updates. For now, update only this slot.
      // The parent ComponentVisualPanel handles syncing targetSlot via a separate prop.
    }
  }

  return (
    <div className="space-y-5">
      <div className="border-b border-[var(--color-border-soft)] pb-2">
        <p className="text-sm font-bold text-[var(--color-espresso)]">{slot.displayName || slot.id}</p>
        <p className="text-xs text-[var(--color-neutral)]/70">Campo de conteúdo</p>
      </div>

      {/* Nome visível */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Nome do campo</label>
        <input
          type="text"
          className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-green)]"
          value={slot.displayName || ''}
          onChange={e => set('displayName', e.target.value)}
          placeholder="Ex: Título principal, Autor..."
        />
      </div>

      {/* Descrição do campo */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Descrição do campo</label>
        <input
          type="text"
          className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-green)]"
          value={slot.description || ''}
          onChange={e => set('description', e.target.value || undefined)}
          placeholder="Ex: Título completo do trabalho acadêmico"
        />
        <p className="text-xs text-[var(--color-neutral)]/70 mt-0.5">Aparece como ajuda para o usuário no criador de trabalhos</p>
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Placeholder</label>
        <input
          type="text"
          className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-green)]"
          value={slot.placeholder || ''}
          onChange={e => set('placeholder', e.target.value || undefined)}
          placeholder="Ex: Digite o título do trabalho..."
        />
        <p className="text-xs text-[var(--color-neutral)]/70 mt-0.5">Texto de exemplo exibido no campo vazio</p>
      </div>

      {/* Tipo de conteúdo */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Tipo de conteúdo</label>
        <div className="space-y-1.5">
          {FIELD_TYPES.map(ft => (
            <label
              key={ft.value}
              className={`flex items-start gap-3 p-2.5 border rounded-lg cursor-pointer transition ${
                slot.type === ft.value
                  ? 'border-[var(--color-green)] bg-[var(--color-success-bg)]'
                  : 'border-[var(--color-border-soft)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-paper)]'
              }`}
            >
              <input
                type="radio"
                name={`type-${slot.id}`}
                className="mt-0.5 text-[var(--color-green)]"
                checked={slot.type === ft.value}
                onChange={() => set('type', ft.value)}
              />
              <div>
                <p className="text-sm font-medium text-[var(--color-espresso)]">{ft.label}</p>
                <p className="text-xs text-[var(--color-neutral)]/70">{ft.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Obrigatório */}
      <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-[var(--color-border-soft)] rounded-lg hover:bg-[var(--color-paper)]">
        <input
          type="checkbox"
          className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)]"
          checked={slot.required}
          onChange={e => set('required', e.target.checked)}
        />
        <div>
          <p className="text-sm font-medium text-[var(--color-espresso)]">Campo obrigatório</p>
          <p className="text-xs text-[var(--color-neutral)]/70">O usuário não pode deixar em branco</p>
        </div>
      </label>

      {/* COMPOSED_TEXT */}
      {slot.type === 'COMPOSED_TEXT' && (
        <div className="space-y-3 p-3 bg-[var(--color-cream)] border border-[var(--color-border-soft)] rounded-lg">
          <p className="text-xs font-bold text-amber-800">Texto gerado automaticamente</p>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Modelo de texto</label>
            <input
              type="text"
              className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400"
              placeholder="Ex: {cidade}, {estado} – {ano}"
              value={slot.template ?? ''}
              onChange={e => set('template', e.target.value)}
            />
            <p className="text-xs text-[var(--color-neutral)]/70 mt-1">Use {'{'} {'}'} para marcar onde cada informação será inserida</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Informações necessárias</label>
            <input
              type="text"
              className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400"
              placeholder="cidade, estado, ano"
              value={(slot.fieldNames ?? []).join(', ')}
              onChange={e => set('fieldNames', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
            <p className="text-xs text-[var(--color-neutral)]/70 mt-1">Separe com vírgula. Devem corresponder ao que está no modelo.</p>
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
              className="w-4 h-4 text-purple-600 rounded border-[var(--color-border-soft)]"
              checked={slot.signatureLineEnabled ?? true}
              onChange={e => set('signatureLineEnabled', e.target.checked)}
            />
            <span className="text-sm font-medium text-[var(--color-espresso)]">Mostrar linha de assinatura</span>
          </label>
          {slot.signatureLineEnabled !== false && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Aparência da linha</label>
              <input
                type="text"
                className="w-full border border-purple-200 rounded-lg p-2.5 text-sm"
                value={slot.signatureLineText ?? '________________________________________'}
                onChange={e => set('signatureLineText', e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Linhas de informação por pessoa</label>
            <p className="text-xs text-[var(--color-neutral)]/70 mb-1">Uma por linha. Use {'{'} nome {'}'}, {'{'} cargo {'}'}, {'{'} instituição {'}'} etc.</p>
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
          <p className="text-[10px] text-[var(--color-neutral)]">Um por linha. Ex: name, title, institutionName, role</p>
          <textarea
            className="w-full border border-violet-200 rounded-lg p-2 text-xs"
            rows={3}
            value={(slot.knownFieldNames ?? []).join('\n')}
            onChange={e => set('knownFieldNames', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
          />
        </div>
      )}

      {/* groupId — só para SINGLE_PAGE, com select visual */}
      {component.ruleType === 'SINGLE_PAGE' && otherSlots.length > 0 && (
        <div className="pt-3 border-t border-[var(--color-border-soft)]">
          <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Agrupar com outros campos</label>
          <p className="text-xs text-[var(--color-neutral)]/70 mb-2">Campos agrupados ficam colados verticalmente, sem espaço entre eles</p>
          <div className="space-y-1.5">
            {otherSlots.map(other => {
              const inSameGroup = !!(slot.groupId && other.groupId === slot.groupId);
              return (
                <label
                  key={other.id}
                  className={`flex items-center gap-2.5 p-2 border rounded-lg cursor-pointer transition ${
                    inSameGroup
                      ? 'border-[var(--color-green)] bg-[var(--color-success-bg)]'
                      : 'border-[var(--color-border-soft)] hover:bg-[var(--color-paper)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[var(--color-green)] rounded border-[var(--color-border-soft)]"
                    checked={inSameGroup}
                    onChange={() => toggleGroup(other)}
                  />
                  <span className="text-sm text-[var(--color-espresso)]">{other.displayName || other.id}</span>
                </label>
              );
            })}
          </div>
          {slot.groupId && currentGroupMembers.length > 0 && (
            <p className="text-xs text-[var(--color-neutral)]/60 mt-1.5">
              Grupo: {currentGroupMembers.map(s => s.displayName || s.id).join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Posicionamento (apenas SINGLE_PAGE) */}
      {component.ruleType === 'SINGLE_PAGE' && (
        <div className="space-y-3 pt-3 border-t border-[var(--color-border-soft)]">
          <p className="text-sm font-bold text-[var(--color-espresso)]">Posição na página</p>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Largura ocupada</label>
            <select
              className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[var(--color-green)]"
              value={slot.horizontalPlacement ?? 'FULL_CONTENT_WIDTH'}
              onChange={e => set('horizontalPlacement', e.target.value as SlotState['horizontalPlacement'])}
            >
              {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {slot.horizontalPlacement === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Recuo esquerda (cm)</label>
                <input type="number" step="0.5" min="0" className="w-full border border-[var(--color-border-soft)] rounded-lg p-2 text-sm"
                  value={slot.customLeftMarginCm ?? 0}
                  onChange={e => set('customLeftMarginCm', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Recuo direita (cm)</label>
                <input type="number" step="0.5" min="0" className="w-full border border-[var(--color-border-soft)] rounded-lg p-2 text-sm"
                  value={slot.customRightMarginCm ?? 0}
                  onChange={e => set('customRightMarginCm', Number(e.target.value))} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Linhas em branco após</label>
              <input type="number" min="0" className="w-full border border-[var(--color-border-soft)] rounded-lg p-2 text-sm"
                value={slot.blankLinesAfter ?? 0}
                onChange={e => set('blankLinesAfter', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Espaço flexível abaixo</label>
              <input type="number" min="0" max="100" className="w-full border border-[var(--color-border-soft)] rounded-lg p-2 text-sm"
                value={slot.gapWeight ?? 10}
                onChange={e => set('gapWeight', parseInt(e.target.value))} />
              <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">1–100, valores maiores afastam mais</p>
            </div>
          </div>
        </div>
      )}

      {/* Aparência tipográfica — sempre visível */}
      <div className="space-y-3 pt-3 border-t border-[var(--color-border-soft)]">
        <p className="text-sm font-bold text-[var(--color-espresso)]">Aparência tipográfica</p>
        <StyleRuleEditor rule={rule} onChange={updated => onAddStyleRule(updated)} hideNameField baseFont={baseFont} />
      </div>
    </div>
  );
}
