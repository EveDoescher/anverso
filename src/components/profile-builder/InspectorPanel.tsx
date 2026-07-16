'use client';

import { useState } from 'react';
import { ComponentState, ComponentRuleType, SlotState, StyleRule, defaultBodyContentState } from '@/lib/profileSerializer';
import { SinglePageForm } from './forms/SinglePageForm';
import { FlowTextualForm } from './forms/FlowTextualForm';
import { BibliographyForm } from './forms/BibliographyForm';
import { BodyContentForm } from './forms/BodyContentForm';
import { SectionedForm } from './forms/SectionedForm';
import { ElementIndexForm } from './forms/ElementIndexForm';
import { SectionIndexForm } from './forms/SectionIndexForm';
import { SlotInspector } from './SlotInspector';
import { Button } from '../ui/Button';

interface Props {
  component: ComponentState | null;
  selectedSlotId: string | null;
  styleRules: StyleRule[];
  allComponents: ComponentState[];
  onUpdateComponent: (updated: ComponentState) => void;
  onAddStyleRule: (rule: StyleRule) => void;
  baseFont?: string;
}

const RULE_TYPE_LABELS: Record<ComponentRuleType, string> = {
  SINGLE_PAGE: 'Página Única',
  FLOW_TEXTUAL: 'Texto Livre',
  BIBLIOGRAPHY: 'Bibliografia',
  BODY_CONTENT: 'Corpo do Texto',
  SECTIONED: 'Secionado',
  ELEMENT_INDEX: 'Índice de Elementos',
  SECTION_INDEX: 'Sumário',
};

const ALL_RULE_TYPES: ComponentRuleType[] = [
  'SINGLE_PAGE', 'FLOW_TEXTUAL', 'BIBLIOGRAPHY', 'BODY_CONTENT', 'SECTIONED', 'ELEMENT_INDEX', 'SECTION_INDEX',
];

export function InspectorPanel({
  component,
  selectedSlotId,
  styleRules,
  allComponents,
  onUpdateComponent,
  onAddStyleRule,
  baseFont,
}: Props) {
  if (!component) {
    return (
      <div className="w-72 shrink-0 flex items-center justify-center text-xs text-[var(--color-neutral)]/70 p-4 text-center">
        Selecione um componente para inspecionar suas propriedades.
      </div>
    );
  }

  const slot = selectedSlotId
    ? (component.slots ?? []).find(s => s.id === selectedSlotId)
    : null;

  function updateSlot(updated: SlotState) {
    const currentSlots = component!.slots ?? [];
    // When a slot's groupId is set, sync other slots in the same group
    // (toggleGroup in SlotInspector only updates the current slot; here we handle the target)
    const slots = currentSlots.map(s => s.id === updated.id ? updated : s);

    // If the updated slot joined a group that belongs to another slot, assign that groupId to the partner
    if (updated.groupId) {
      const groupOwner = slots.find(s => s.id !== updated.id && s.groupId === updated.groupId);
      if (!groupOwner) {
        // New group — find any slot in current list that was explicitly toggled
        // We can't know which "other" slot was toggled here; the groupId encodes the pair
        // Parse the auto-generated groupId: `{compId}.grp.{slotA}.{slotB}`
        const grpParts = updated.groupId.split('.grp.');
        if (grpParts.length === 2) {
          const [, pairPart] = grpParts;
          const [slotA, slotB] = pairPart.split('.');
          const partnerId = slotA === updated.id ? slotB : slotA;
          const partnerIdx = slots.findIndex(s => s.id === partnerId);
          if (partnerIdx !== -1 && !slots[partnerIdx].groupId) {
            slots[partnerIdx] = { ...slots[partnerIdx], groupId: updated.groupId };
          }
        }
      }
    }

    onUpdateComponent({ ...component!, slots });
  }

  return (
    <div className="w-96 shrink-0 flex flex-col border-l border-[var(--color-border-soft)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--color-border-soft)] bg-[var(--color-paper)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-wider">
          {selectedSlotId ? 'Campo de conteúdo' : 'Propriedades'}
        </span>
        {selectedSlotId && (
          <Button variant="ghost" size="sm" onClick={() => onUpdateComponent(component)}>← Voltar ao componente</Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {slot && selectedSlotId ? (
          <SlotInspector
            component={component}
            slot={slot}
            styleRules={styleRules}
            allSlots={component.slots ?? []}
            onUpdateSlot={updateSlot}
            onAddStyleRule={onAddStyleRule}
            baseFont={baseFont}
          />
        ) : (
          <ComponentInspector
            component={component}
            styleRules={styleRules}
            allComponents={allComponents}
            onUpdate={onUpdateComponent}
            onAddStyleRule={onAddStyleRule}
          />
        )}
      </div>
    </div>
  );
}

function ComponentInspector({ component, styleRules, allComponents, onUpdate, onAddStyleRule }: {
  component: ComponentState;
  styleRules: StyleRule[];
  allComponents: ComponentState[];
  onUpdate: (c: ComponentState) => void;
  onAddStyleRule: (r: StyleRule) => void;
}) {
  const [pendingType, setPendingType] = useState<ComponentRuleType | null>(null);

  function confirmTypeChange() {
    if (!pendingType) return;
    const updated: ComponentState = {
      id: component.id,
      displayName: component.displayName,
      description: component.description,
      ruleType: pendingType,
      enabled: component.enabled,
      // Reset type-specific data
      ...(pendingType === 'SINGLE_PAGE' && { slots: [], policy: undefined }),
      ...(pendingType === 'FLOW_TEXTUAL' && { flowItems: [] }),
      ...(pendingType === 'BODY_CONTENT' && { bodyContent: defaultBodyContentState() }),
    };
    onUpdate(updated);
    setPendingType(null);
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border-soft)] pb-2">
        <p className="text-sm font-bold text-[var(--color-espresso)]">{component.displayName || component.id}</p>
      </div>

      {/* Descrição do componente */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Descrição do componente</label>
        <textarea
          className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[var(--color-green)] resize-none"
          rows={2}
          value={component.description || ''}
          onChange={e => onUpdate({ ...component, description: e.target.value || undefined })}
          placeholder="Ex: Capa do trabalho com título, autor e instituição"
        />
        <p className="text-xs text-[var(--color-neutral)]/70 mt-0.5">Exibida como orientação ao usuário no criador de trabalhos</p>
      </div>

      {/* Mudança de tipo com confirmação */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Tipo do componente</label>
        <select
          className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-[var(--color-green)]"
          value={component.ruleType}
          onChange={e => {
            const newType = e.target.value as ComponentRuleType;
            if (newType !== component.ruleType) setPendingType(newType);
          }}
        >
          {ALL_RULE_TYPES.map(t => (
            <option key={t} value={t}>{RULE_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {component.ruleType === 'SINGLE_PAGE' && (
        <SinglePageForm comp={component} onChange={onUpdate} />
      )}
      {component.ruleType === 'FLOW_TEXTUAL' && (
        <FlowTextualForm comp={component} onChange={onUpdate} />
      )}
      {component.ruleType === 'BIBLIOGRAPHY' && (
        <BibliographyForm comp={component} onChange={onUpdate} styleRules={styleRules} />
      )}
      {component.ruleType === 'BODY_CONTENT' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-neutral)]">
            Configurações de numeração, quebras de página e rótulos para referências cruzadas.
          </p>
          <BodyContentForm
            state={component.bodyContent ?? defaultBodyContentState()}
            onChange={updated => onUpdate({ ...component, bodyContent: updated })}
          />
        </div>
      )}
      {component.ruleType === 'SECTIONED' && (
        <SectionedForm comp={component} onChange={onUpdate} allComponents={allComponents} styleRules={styleRules} />
      )}
      {component.ruleType === 'ELEMENT_INDEX' && (
        <ElementIndexForm comp={component} onChange={onUpdate} styleRules={styleRules} allComponents={allComponents} />
      )}
      {component.ruleType === 'SECTION_INDEX' && (
        <SectionIndexForm comp={component} onChange={onUpdate} styleRules={styleRules} allComponents={allComponents} />
      )}

      {/* Modal de confirmação de mudança de tipo */}
      {pendingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-sm font-bold text-[var(--color-espresso)]">Mudar tipo do componente?</p>
            <p className="text-sm text-[var(--color-neutral)]">
              Alterar para <strong>{RULE_TYPE_LABELS[pendingType]}</strong> irá remover todos os campos (slots), itens de fluxo e configurações específicas do tipo atual. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setPendingType(null)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={confirmTypeChange}>Confirmar mudança</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
