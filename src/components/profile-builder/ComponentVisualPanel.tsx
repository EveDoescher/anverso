'use client';

import React, { useState } from 'react';
import { ComponentState, SlotState, SlotType, StyleRule, StyleRuleType, BibEntryPart, BibRefType, defaultStyleRule, defaultBodyContentState } from '@/lib/profileSerializer';
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
import { StyleRuleEditor } from './StyleRuleEditor';
import {
  BookOpen, BookMarked, Newspaper, Globe, Scale, GraduationCap, FileText, ClipboardList, Ruler,
  Check, AlertTriangle,
} from 'lucide-react';

interface Props {
  component: ComponentState | null;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  onUpdateComponent: (updated: ComponentState) => void;
  styleRules: StyleRule[];
  onAddStyleRule: (rule: StyleRule) => void;
}

// ── Position-based color palette ──

const POSITION_COLORS = [
  'bg-blue-300', 'bg-rose-300', 'bg-emerald-300', 'bg-amber-300',
  'bg-violet-300', 'bg-cyan-300', 'bg-orange-300', 'bg-teal-300',
  'bg-pink-300', 'bg-lime-300', 'bg-sky-300', 'bg-fuchsia-300',
];

function colorForIndex(idx: number): string {
  return POSITION_COLORS[idx % POSITION_COLORS.length];
}

function nameToId(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    || 'campo';
}

// ── SINGLE_PAGE sub-components ──

function FieldPreviewBlock({ slot, index, isSelected }: { slot: SlotState; index: number; isSelected: boolean }) {
  const colorClass = colorForIndex(index);
  const placement = slot.horizontalPlacement ?? 'FULL_CONTENT_WIDTH';
  const widthClass = placement === 'FROM_PAGE_CENTER_TO_RIGHT_MARGIN' ? 'w-1/2 self-end' : 'w-full';
  return (
    <div
      className={`${widthClass} h-5 rounded ${colorClass} ${isSelected ? 'ring-2 ring-slate-700' : ''} opacity-90 flex items-center px-2`}
      title={slot.displayName || slot.id}
    >
      <span className="text-[9px] font-semibold text-white truncate drop-shadow-sm">
        {slot.displayName || slot.id}
      </span>
    </div>
  );
}

function SortableField({ slot, index, isSelected, onSelect, onRemove }: {
  slot: SlotState; index: number; isSelected: boolean;
  onSelect: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all select-none ${
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <button {...attributes} {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
        onClick={e => e.stopPropagation()}>≡</button>
      <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colorForIndex(index)}`} />
      <span className="flex-1 text-sm font-medium text-slate-700 min-w-0 truncate">{slot.displayName || slot.id}</span>
      {slot.required && <span className="text-[10px] text-red-500 font-bold shrink-0" title="Obrigatório">*</span>}
      <button onClick={e => { e.stopPropagation(); onRemove(); }}
        className="text-slate-300 hover:text-red-500 font-bold shrink-0 text-base leading-none">×</button>
    </div>
  );
}

function SinglePagePanel({ component, selectedSlotId, onSelectSlot, onUpdateComponent }: {
  component: ComponentState; selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void; onUpdateComponent: (c: ComponentState) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const slots = component.slots ?? [];
  const [newFieldName, setNewFieldName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = slots.findIndex(s => s.id === active.id);
      const newIdx = slots.findIndex(s => s.id === over.id);
      onUpdateComponent({ ...component, slots: arrayMove(slots, oldIdx, newIdx) });
    }
  }

  function confirmAddField() {
    if (!newFieldName.trim()) return;
    const id = nameToId(newFieldName.trim());
    const uniqueId = slots.find(s => s.id === id) ? `${id}_${slots.length}` : id;
    const newSlot: SlotState = {
      id: uniqueId, displayName: newFieldName.trim(), type: 'TEXT', required: false,
      horizontalPlacement: 'FULL_CONTENT_WIDTH', gapWeight: 10,
    };
    onUpdateComponent({ ...component, slots: [...slots, newSlot] });
    onSelectSlot(newSlot.id);
    setNewFieldName('');
    setShowAddField(false);
  }

  function removeField(id: string) {
    onUpdateComponent({ ...component, slots: slots.filter(s => s.id !== id) });
    if (selectedSlotId === id) onSelectSlot(null);
  }

  return (
    <div className="flex-1 overflow-auto p-3 space-y-3">
      {slots.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Prévia da página</p>
          <div className="border border-slate-300 rounded bg-white p-2 space-y-1.5 min-h-[120px] flex flex-col">
            {slots.map((slot, idx) => (
              <FieldPreviewBlock key={slot.id} slot={slot} index={idx} isSelected={selectedSlotId === slot.id} />
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Cada campo tem uma cor única para facilitar a identificação.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campos de conteúdo</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slots.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {slots.map((slot, idx) => (
              <SortableField key={slot.id} slot={slot} index={idx}
                isSelected={selectedSlotId === slot.id}
                onSelect={() => onSelectSlot(slot.id)}
                onRemove={() => removeField(slot.id)} />
            ))}
          </SortableContext>
        </DndContext>

        {slots.length === 0 && !showAddField && (
          <div className="text-xs text-slate-400 text-center p-4 border-2 border-dashed border-slate-100 rounded-lg">
            Nenhum campo. Adicione um abaixo.
          </div>
        )}

        {showAddField ? (
          <div className="flex gap-2 items-center">
            <input type="text" autoFocus
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do campo (ex: Título, Autor...)"
              value={newFieldName}
              onChange={e => setNewFieldName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmAddField();
                if (e.key === 'Escape') { setShowAddField(false); setNewFieldName(''); }
              }} />
            <button onClick={confirmAddField}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">OK</button>
            <button onClick={() => { setShowAddField(false); setNewFieldName(''); }}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">✕</button>
          </div>
        ) : (
          <button onClick={() => setShowAddField(true)}
            className="w-full border border-dashed border-slate-300 rounded-lg py-2 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition">
            + Adicionar campo
          </button>
        )}
      </div>
    </div>
  );
}

// ── BODY_CONTENT: Typography hierarchy panel ──

const BODY_LEVELS: { key: string; label: string; sample: string; styleType: StyleRuleType }[] = [
  { key: 'paragraph', label: 'Parágrafo', sample: 'Este é um parágrafo de corpo do texto com recuo de primeira linha e texto justificado.', styleType: 'PARAGRAPH' },
  { key: 'h1', label: 'Título 1', sample: '1  INTRODUÇÃO', styleType: 'HEADING_1' },
  { key: 'h2', label: 'Título 2', sample: '1.1  Fundamentação Teórica', styleType: 'HEADING_2' },
  { key: 'h3', label: 'Título 3', sample: '1.1.1  Contexto histórico', styleType: 'HEADING_3' },
  { key: 'h4', label: 'Título 4', sample: '1.1.1.1  Subdivisão', styleType: 'HEADING_4' },
  { key: 'h5', label: 'Título 5', sample: 'Nível 5 — Subelemento', styleType: 'HEADING_5' },
  { key: 'h6', label: 'Título 6', sample: 'Nível 6 — Detalhe', styleType: 'HEADING_6' },
];

const BODY_LEVEL_DEFAULTS: Record<string, Partial<StyleRule>> = {
  paragraph: { alignment: 'JUSTIFIED', firstLineIndentCm: 1.25, fontSizePt: 12 },
  h1: { bold: true, uppercase: true, fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
  h2: { bold: true, fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
  h3: { bold: true, italic: true, fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
  h4: { italic: true, fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
  h5: { fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
  h6: { fontSizePt: 12, alignment: 'LEFT', firstLineIndentCm: 0 },
};

function BodyHierarchyPanel({ component, styleRules, onUpdateComponent, onAddStyleRule }: {
  component: ComponentState; styleRules: StyleRule[];
  onUpdateComponent: (c: ComponentState) => void; onAddStyleRule: (r: StyleRule) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const bc = component.bodyContent ?? defaultBodyContentState();

  function getStyleId(key: string): string {
    if (key === 'paragraph') return bc.paragraphStyleId || `${component.id}.paragraph`;
    const idx = parseInt(key.slice(1)) - 1;
    return bc.sectionTitleStyleIdsByLevel?.[idx] || `${component.id}.${key}`;
  }

  function setStyleId(key: string, styleId: string) {
    const updated = { ...bc };
    if (key === 'paragraph') {
      updated.paragraphStyleId = styleId;
    } else {
      const idx = parseInt(key.slice(1)) - 1;
      const levels = [...(updated.sectionTitleStyleIdsByLevel ?? [])];
      while (levels.length <= idx) levels.push('');
      levels[idx] = styleId;
      updated.sectionTitleStyleIdsByLevel = levels;
    }
    onUpdateComponent({ ...component, bodyContent: updated });
  }

  function getOrCreateRule(key: string): StyleRule {
    const styleId = getStyleId(key);
    const existing = styleRules.find(r => r.id === styleId);
    if (existing) return existing;
    const level = BODY_LEVELS.find(l => l.key === key)!;
    const newRule = defaultStyleRule(styleId, {
      type: level.styleType,
      ...BODY_LEVEL_DEFAULTS[key],
    });
    onAddStyleRule(newRule);
    setStyleId(key, styleId);
    return newRule;
  }

  const selectedRule = selectedLevel ? getOrCreateRule(selectedLevel) : null;

  return (
    <div className="flex h-full">
      {/* Hierarchy list */}
      <div className="w-56 shrink-0 border-r border-slate-200 flex flex-col overflow-auto">
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hierarquia tipográfica</span>
        </div>
        <div className="flex-1 overflow-auto">
          {BODY_LEVELS.map(level => {
            const rule = styleRules.find(r => r.id === getStyleId(level.key)) ?? defaultStyleRule(getStyleId(level.key), { type: level.styleType, ...BODY_LEVEL_DEFAULTS[level.key] });
            const isSelected = selectedLevel === level.key;
            return (
              <button
                key={level.key}
                onClick={() => { setSelectedLevel(level.key); getOrCreateRule(level.key); }}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
              >
                <div
                  className="truncate"
                  style={{
                    fontFamily: rule.fontFamily,
                    fontSize: `${Math.min(rule.fontSizePt, 15)}px`,
                    fontWeight: rule.bold ? 'bold' : 'normal',
                    fontStyle: rule.italic ? 'italic' : 'normal',
                    textTransform: rule.uppercase ? 'uppercase' : 'none',
                  }}
                >
                  {level.sample}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {rule.fontFamily} {rule.fontSizePt}pt {rule.bold ? '• negrito' : ''}{rule.italic ? '• itálico' : ''}{rule.uppercase ? '• maiúsculas' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Style editor */}
      <div className="flex-1 overflow-auto">
        {selectedLevel && selectedRule ? (
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm font-bold text-slate-800">
                {BODY_LEVELS.find(l => l.key === selectedLevel)?.label}
              </p>
              <p className="text-xs text-slate-400">Estilo tipográfico</p>
            </div>
            <StyleRuleEditor
              rule={selectedRule}
              onChange={updated => onAddStyleRule(updated)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400 text-center p-8">
            Clique em um nível da hierarquia para editar seu estilo tipográfico.
          </div>
        )}
      </div>
    </div>
  );
}

// ── BIBLIOGRAPHY: Rich reference editor ──

const BIB_REF_TYPES: { value: BibRefType; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: 'BOOK', label: 'Livro', Icon: BookMarked },
  { value: 'BOOK_CHAPTER', label: 'Capítulo de Livro', Icon: BookOpen },
  { value: 'JOURNAL', label: 'Artigo de Periódico', Icon: Newspaper },
  { value: 'WEBSITE', label: 'Website', Icon: Globe },
  { value: 'LEGISLATION', label: 'Legislação', Icon: Scale },
  { value: 'THESIS', label: 'Tese / Dissertação', Icon: GraduationCap },
  { value: 'CONFERENCE_PAPER', label: 'Artigo de Conferência', Icon: ClipboardList },
  { value: 'REPORT', label: 'Relatório Técnico', Icon: FileText },
  { value: 'STANDARD', label: 'Norma Técnica', Icon: Ruler },
];

const BIB_SAMPLE_DATA: Record<string, string> = {
  authors: 'SILVA, João A.; SANTOS, Maria B.',
  title: 'Fundamentos de Metodologia Científica',
  subtitle: 'Uma abordagem prática',
  edition: '3',
  city: 'São Paulo',
  publisher: 'Atlas',
  year: '2024',
  pages: '250',
  volume: '2',
  issue: '4',
  doi: '10.1234/exemplo.2024',
  url: 'https://exemplo.com.br',
  accessDate: '10 jul. 2024',
  bookTitle: 'Coletânea de Pesquisas em Educação',
  bookAuthors: 'OLIVEIRA, C. D. (org.)',
  journal: 'Revista Brasileira de Ciência',
  institution: 'Universidade de São Paulo',
};

function renderBibPreview(parts: BibEntryPart[]): string {
  return parts.map(p => {
    let value: string;
    if (p.source.startsWith('literal:')) {
      value = p.source.slice(8);
    } else {
      value = BIB_SAMPLE_DATA[p.source] ?? `{${p.source}}`;
    }
    if (!value && p.optional) return '';
    const formatted = p.bold ? value.toUpperCase() : value;
    return `${p.prefix}${formatted}${p.suffix}`;
  }).filter(Boolean).join('');
}

const BIB_SOURCES = ['authors', 'title', 'subtitle', 'edition', 'city', 'publisher', 'year', 'pages', 'volume', 'issue', 'doi', 'url', 'accessDate', 'bookTitle', 'bookAuthors', 'journal', 'institution'];

function BibEntryEditor({ parts, onChange }: { parts: BibEntryPart[]; onChange: (p: BibEntryPart[]) => void }) {
  function update(idx: number, key: keyof BibEntryPart, value: unknown) {
    onChange(parts.map((p, i) => i === idx ? { ...p, [key]: value } : p));
  }
  function add() {
    onChange([...parts, { source: 'title', bold: false, italic: false, prefix: '', suffix: '. ', optional: false }]);
  }
  function remove(idx: number) {
    onChange(parts.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-1.5">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs bg-white rounded border border-slate-200 p-1.5">
          <select
            className="border border-slate-200 rounded px-1 py-0.5 text-[10px] bg-white max-w-[110px]"
            value={p.source}
            onChange={e => update(i, 'source', e.target.value)}
          >
            {BIB_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value={`literal:${p.source.startsWith('literal:') ? p.source.slice(8) : ''}`}>literal...</option>
          </select>
          <input
            className="w-12 border border-slate-200 rounded px-1 py-0.5 text-[10px]"
            placeholder="antes"
            value={p.prefix}
            onChange={e => update(i, 'prefix', e.target.value)}
          />
          <input
            className="w-12 border border-slate-200 rounded px-1 py-0.5 text-[10px]"
            placeholder="depois"
            value={p.suffix}
            onChange={e => update(i, 'suffix', e.target.value)}
          />
          <label className="flex items-center gap-0.5 cursor-pointer text-[10px] shrink-0">
            <input type="checkbox" className="w-3 h-3" checked={p.bold} onChange={e => update(i, 'bold', e.target.checked)} />
            <span className="font-bold">B</span>
          </label>
          <label className="flex items-center gap-0.5 cursor-pointer text-[10px] shrink-0">
            <input type="checkbox" className="w-3 h-3" checked={p.optional} onChange={e => update(i, 'optional', e.target.checked)} />
            <span>opt</span>
          </label>
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 font-bold ml-auto">×</button>
        </div>
      ))}
      <button onClick={add} className="w-full text-[10px] text-blue-600 hover:underline border border-dashed border-blue-200 rounded py-1">
        + Adicionar parte
      </button>
    </div>
  );
}

function BibliographyRichPanel({ component, onUpdateComponent }: {
  component: ComponentState; onUpdateComponent: (c: ComponentState) => void;
}) {
  const [selectedType, setSelectedType] = useState<BibRefType | null>(null);
  const entryFormats = component.entryFormats ?? {};

  function setEntryFormat(type: BibRefType, parts: BibEntryPart[]) {
    onUpdateComponent({ ...component, entryFormats: { ...entryFormats, [type]: parts } });
  }

  const currentParts = selectedType ? (entryFormats[selectedType] ?? []) : [];
  const preview = selectedType && currentParts.length > 0 ? renderBibPreview(currentParts) : null;

  return (
    <div className="flex h-full">
      {/* Type list */}
      <div className="w-52 shrink-0 border-r border-slate-200 flex flex-col overflow-auto">
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipos de referência</span>
        </div>
        <div className="flex-1 overflow-auto">
          {BIB_REF_TYPES.map(rt => {
            const parts = entryFormats[rt.value];
            const isConfigured = parts && parts.length > 0;
            const isSelected = selectedType === rt.value;
            return (
              <button
                key={rt.value}
                onClick={() => setSelectedType(rt.value)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left border-b border-slate-100 transition-colors ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'}`}
              >
                <rt.Icon size={15} className="shrink-0 text-slate-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{rt.label}</p>
                  {isConfigured ? (
                    <p className="text-[9px] text-green-600 flex items-center gap-0.5"><Check size={9} /> {parts.length} partes</p>
                  ) : (
                    <p className="text-[9px] text-amber-500 flex items-center gap-0.5"><AlertTriangle size={9} /> não configurado</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {selectedType ? (
          <>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {BIB_REF_TYPES.find(r => r.value === selectedType)?.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte a referência arrastando e configurando as partes abaixo.
              </p>
            </div>

            {preview && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Prévia com dados de exemplo</p>
                <p className="text-xs text-slate-700 leading-relaxed font-serif">{preview}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Partes da referência</p>
              <BibEntryEditor
                parts={currentParts}
                onChange={parts => setEntryFormat(selectedType, parts)}
              />
            </div>

            <details className="text-[10px] text-slate-400">
              <summary className="cursor-pointer hover:text-slate-600">Campos disponíveis</summary>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[9px]">
                {BIB_SOURCES.map(s => (
                  <span key={s} className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </details>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400 text-center">
            Selecione um tipo de referência para configurar seu formato.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ──

export function ComponentVisualPanel({ component, selectedSlotId, onSelectSlot, onUpdateComponent, styleRules, onAddStyleRule }: Props) {
  if (!component) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400 border-r border-slate-200">
        Selecione um componente na coluna esquerda.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
        <span className="text-sm font-bold text-slate-700">
          {component.displayName || component.id}
        </span>
        <span className="ml-2 text-[10px] text-slate-400 uppercase tracking-wide">
          {component.ruleType === 'SINGLE_PAGE' ? 'Página única' :
           component.ruleType === 'BODY_CONTENT' ? 'Corpo do texto' :
           component.ruleType === 'BIBLIOGRAPHY' ? 'Referências' :
           component.ruleType === 'FLOW_TEXTUAL' ? 'Texto livre' :
           component.ruleType === 'ELEMENT_INDEX' ? 'Índice de elementos' :
           component.ruleType === 'SECTION_INDEX' ? 'Sumário' :
           component.ruleType === 'SECTIONED' ? 'Secionado' : ''}
        </span>
      </div>

      {component.ruleType === 'SINGLE_PAGE' ? (
        <SinglePagePanel
          component={component}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          onUpdateComponent={onUpdateComponent}
        />
      ) : component.ruleType === 'BODY_CONTENT' ? (
        <BodyHierarchyPanel
          component={component}
          styleRules={styleRules}
          onUpdateComponent={onUpdateComponent}
          onAddStyleRule={onAddStyleRule}
        />
      ) : component.ruleType === 'BIBLIOGRAPHY' ? (
        <BibliographyRichPanel
          component={component}
          onUpdateComponent={onUpdateComponent}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200 p-4 max-w-xs text-center">
            <p className="font-semibold text-slate-700 mb-1">Configure no painel ao lado</p>
            <p>As propriedades deste componente ficam no inspector de propriedades à direita.</p>
          </div>
        </div>
      )}
    </div>
  );
}
