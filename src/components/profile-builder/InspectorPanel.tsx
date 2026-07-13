'use client';

import { ComponentState, SlotState, StyleRule, defaultBodyContentState } from '@/lib/profileSerializer';
import { SinglePageForm } from './forms/SinglePageForm';
import { FlowTextualForm } from './forms/FlowTextualForm';
import { BibliographyForm } from './forms/BibliographyForm';
import { BodyContentForm } from './forms/BodyContentForm';
import { SectionedForm } from './forms/SectionedForm';
import { ElementIndexForm } from './forms/ElementIndexForm';
import { SectionIndexForm } from './forms/SectionIndexForm';
import { SlotInspector } from './SlotInspector';

interface Props {
  component: ComponentState | null;
  selectedSlotId: string | null;
  styleRules: StyleRule[];
  allComponents: ComponentState[];
  onUpdateComponent: (updated: ComponentState) => void;
  onAddStyleRule: (rule: StyleRule) => void;
}

export function InspectorPanel({
  component,
  selectedSlotId,
  styleRules,
  allComponents,
  onUpdateComponent,
  onAddStyleRule,
}: Props) {
  if (!component) {
    return (
      <div className="w-72 shrink-0 flex items-center justify-center text-xs text-slate-400 p-4 text-center">
        Selecione um componente para inspecionar suas propriedades.
      </div>
    );
  }

  const slot = selectedSlotId
    ? (component.slots ?? []).find(s => s.id === selectedSlotId)
    : null;

  function updateSlot(updated: SlotState) {
    const slots = (component!.slots ?? []).map(s => s.id === updated.id ? updated : s);
    onUpdateComponent({ ...component!, slots });
  }

  const bodyContentIds = allComponents
    .filter(c => c.ruleType === 'BODY_CONTENT')
    .map(c => c.id);

  return (
    <div className="w-96 shrink-0 flex flex-col border-l border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {selectedSlotId ? 'Campo de conteúdo' : 'Propriedades'}
        </span>
        {selectedSlotId && (
          <button
            onClick={() => onUpdateComponent(component)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Voltar ao componente
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3">
        {slot && selectedSlotId ? (
          <SlotInspector
            component={component}
            slot={slot}
            styleRules={styleRules}
            onUpdateSlot={updateSlot}
            onAddStyleRule={onAddStyleRule}
          />
        ) : (
          <ComponentInspector
            component={component}
            bodyContentIds={bodyContentIds}
            styleRules={styleRules}
            allComponents={allComponents}
            onUpdate={onUpdateComponent}
            onAddStyleRule={onAddStyleRule}
            onDeleteComponent={() => {/* handled in parent */}}
          />
        )}
      </div>
    </div>
  );
}

function ComponentInspector({ component, bodyContentIds, styleRules, allComponents, onUpdate, onAddStyleRule, onDeleteComponent }: {
  component: ComponentState;
  bodyContentIds: string[];
  styleRules: StyleRule[];
  allComponents: ComponentState[];
  onUpdate: (c: ComponentState) => void;
  onAddStyleRule: (r: StyleRule) => void;
  onDeleteComponent: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <p className="text-sm font-bold text-slate-800">{component.displayName || component.id}</p>
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
          <p className="text-xs text-slate-500">
            Configurações de numeração, quebras de página e rótulos para referências cruzadas.
          </p>
          <BodyContentForm
            state={component.bodyContent ?? defaultBodyContentState()}
            onChange={updated => onUpdate({ ...component, bodyContent: updated })}
          />
        </div>
      )}
      {component.ruleType === 'SECTIONED' && (
        <SectionedForm comp={component} onChange={onUpdate} bodyContentIds={bodyContentIds} styleRules={styleRules} />
      )}
      {component.ruleType === 'ELEMENT_INDEX' && (
        <ElementIndexForm comp={component} onChange={onUpdate} styleRules={styleRules} allComponents={allComponents} />
      )}
      {component.ruleType === 'SECTION_INDEX' && (
        <SectionIndexForm comp={component} onChange={onUpdate} styleRules={styleRules} allComponents={allComponents} />
      )}
    </div>
  );
}
