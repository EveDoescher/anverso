'use client';

import { ComponentState, ComponentRuleType } from '@/lib/profileSerializer';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  components: ComponentState[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (components: ComponentState[]) => void;
  onAdd: () => void;
  validationErrors: Record<string, string[]>;
}

const RULE_TYPE_LABELS: Record<ComponentRuleType, string> = {
  SINGLE_PAGE: 'Página Única',
  FLOW_TEXTUAL: 'Texto Livre',
  BIBLIOGRAPHY: 'Bibliografia',
  BODY_CONTENT: 'Corpo',
  SECTIONED: 'Secionado',
  ELEMENT_INDEX: 'Índice',
  SECTION_INDEX: 'Sumário',
};

const RULE_TYPE_COLORS: Record<ComponentRuleType, string> = {
  SINGLE_PAGE: 'bg-blue-100 text-blue-700',
  FLOW_TEXTUAL: 'bg-emerald-100 text-emerald-700',
  BIBLIOGRAPHY: 'bg-amber-100 text-amber-700',
  BODY_CONTENT: 'bg-purple-100 text-purple-700',
  SECTIONED: 'bg-orange-100 text-orange-700',
  ELEMENT_INDEX: 'bg-cyan-100 text-cyan-700',
  SECTION_INDEX: 'bg-indigo-100 text-indigo-700',
};

function SortableItem({ comp, isSelected, onSelect, hasError }: {
  comp: ComponentState;
  isSelected: boolean;
  onSelect: () => void;
  hasError: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: comp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer transition-all select-none ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      } ${!comp.enabled ? 'opacity-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing text-base shrink-0"
        onClick={e => e.stopPropagation()}
      >
        ≡
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700 truncate">{comp.displayName || comp.id}</span>
          {hasError && <span className="text-orange-500 text-[10px]">⚠</span>}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${RULE_TYPE_COLORS[comp.ruleType]}`}>
          {RULE_TYPE_LABELS[comp.ruleType]}
        </span>
      </div>
    </div>
  );
}

export function ComponentList({ components, selectedId, onSelect, onChange, onAdd, validationErrors }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = components.findIndex(c => c.id === active.id);
      const newIdx = components.findIndex(c => c.id === over.id);
      onChange(arrayMove(components, oldIdx, newIdx));
    }
  }

  return (
    <div className="flex flex-col h-full border-r border-slate-200 w-56 shrink-0">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Estrutura</span>
        <button
          onClick={onAdd}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium hover:bg-blue-700 transition"
        >
          + Adicionar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {components.length === 0 && (
          <div className="text-xs text-slate-400 text-center p-6 border-2 border-dashed border-slate-100 rounded-lg mt-4">
            Nenhum componente. Adicione o primeiro!
          </div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {components.map(comp => (
              <SortableItem
                key={comp.id}
                comp={comp}
                isSelected={selectedId === comp.id}
                onSelect={() => onSelect(comp.id)}
                hasError={(validationErrors[comp.id] ?? []).length > 0}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
