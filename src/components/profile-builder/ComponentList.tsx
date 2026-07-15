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
import { AlertTriangle, GripVertical, Plus } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';

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
  SINGLE_PAGE: 'bg-blue-50 text-blue-700 border-blue-200',
  FLOW_TEXTUAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BIBLIOGRAPHY: 'bg-amber-50 text-[var(--color-gold)] border-amber-200',
  BODY_CONTENT: 'bg-purple-50 text-purple-700 border-purple-200',
  SECTIONED: 'bg-orange-50 text-orange-700 border-orange-200',
  ELEMENT_INDEX: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  SECTION_INDEX: 'bg-[var(--color-success-bg)] text-[var(--color-green)] border-[var(--color-success-soft)]',
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
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-3 border rounded-xl cursor-pointer transition-all select-none group ${
        isSelected
          ? 'border-[var(--color-green)] bg-[var(--color-success-bg)] shadow-[var(--shadow-soft)]'
          : 'border-[var(--color-border-soft)] hover:border-[var(--color-border)] hover:bg-[var(--color-paper-soft)] bg-white'
      } ${!comp.enabled ? 'opacity-40 grayscale-[50%]' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-[var(--color-neutral)]/30 hover:text-[var(--color-neutral)] cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-sm font-bold truncate ${isSelected ? 'text-[var(--color-green)]' : 'text-[var(--color-espresso)]'}`}>
            {comp.displayName || comp.id}
          </span>
          {hasError && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${RULE_TYPE_COLORS[comp.ruleType]}`}>
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
    <div className="flex flex-col h-full border-r border-[var(--color-border-soft)] w-72 shrink-0 bg-[var(--color-paper)]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-soft)] bg-white">
        <span className="text-xs font-bold text-[var(--color-neutral)] uppercase tracking-widest">Estrutura</span>
        <IconButton
          variant="ghost"
          icon={Plus}
          label="Adicionar Componente"
          onClick={onAdd}
          className="w-8 h-8 text-[var(--color-green)] hover:bg-[var(--color-success-bg)]"
        />
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {components.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[var(--color-neutral)]/70">
            <div className="w-12 h-12 rounded-full bg-white border border-[var(--color-border-soft)] flex items-center justify-center mb-3">
              <Plus size={20} className="text-[var(--color-neutral)]/40" />
            </div>
            <p className="text-xs">Nenhum componente. Adicione o primeiro!</p>
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
