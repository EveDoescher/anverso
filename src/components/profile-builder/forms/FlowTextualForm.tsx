'use client';

import { ComponentState, FlowItem, FlowItemType } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
}

const ITEM_TYPES: { value: FlowItemType; label: string }[] = [
  { value: 'HEADING', label: 'Título Fixo' },
  { value: 'BLANK_LINES', label: 'Linhas em Branco' },
  { value: 'PLAIN_TEXT', label: 'Parágrafo Simples' },
  { value: 'TABLE_BLOCK', label: 'Tabela' },
  { value: 'BOLD_LABELED_KEYWORDS', label: 'Palavras-chave' },
  { value: 'PAIR_LIST', label: 'Lista de Pares' },
  { value: 'REPEAT_GROUP', label: 'Grupo de Repetição' },
];

function defaultItem(type: FlowItemType): FlowItem {
  switch (type) {
    case 'HEADING': return { type, text: 'TÍTULO', styleId: '' };
    case 'BLANK_LINES': return { type, count: 1 };
    case 'PLAIN_TEXT': return { type, slotName: 'texto', styleId: '' };
    case 'TABLE_BLOCK': return { type, headers: ['Coluna 1'], rowsSlotName: 'linhas', styleId: '' };
    case 'BOLD_LABELED_KEYWORDS': return { type, labelSlotName: 'rotulo', keywordsSlotName: 'palavras', separator: '; ', terminator: '.', styleId: '' };
    case 'PAIR_LIST': return { type, termsSlotName: 'termos', definitionsSlotName: 'definicoes', separator: ' — ', styleId: '' };
    case 'REPEAT_GROUP': return { type, entriesSlotName: 'entradas', pageBreakBetweenEntries: false, group: [] };
  }
}

function ItemEditor({ item, idx, onUpdate, onRemove }: {
  item: FlowItem;
  idx: number;
  onUpdate: (i: FlowItem) => void;
  onRemove: () => void;
}) {
  function set<K extends keyof FlowItem>(key: K, value: FlowItem[K]) {
    onUpdate({ ...item, [key]: value });
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center gap-2">
        <select
          className="flex-1 border border-slate-200 rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={item.type}
          onChange={e => onUpdate(defaultItem(e.target.value as FlowItemType))}
        >
          {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-sm font-bold px-1">×</button>
      </div>

      {item.type === 'HEADING' && (
        <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
          placeholder="Texto fixo do título"
          value={item.text ?? ''} onChange={e => set('text', e.target.value)} />
      )}

      {item.type === 'BLANK_LINES' && (
        <input type="number" min="1" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
          value={item.count ?? 1} onChange={e => set('count', parseInt(e.target.value))} />
      )}

      {item.type === 'PLAIN_TEXT' && (
        <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
          placeholder="Nome do slot (ex: texto)"
          value={item.slotName ?? ''} onChange={e => set('slotName', e.target.value)} />
      )}

      {item.type === 'TABLE_BLOCK' && (
        <div className="space-y-1">
          <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            placeholder="Cabeçalhos (separados por vírgula)"
            value={(item.headers ?? []).join(', ')}
            onChange={e => set('headers', e.target.value.split(',').map(s => s.trim()))} />
          <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do slot de linhas (ex: linhas)"
            value={item.rowsSlotName ?? ''} onChange={e => set('rowsSlotName', e.target.value)} />
        </div>
      )}

      {item.type === 'BOLD_LABELED_KEYWORDS' && (
        <div className="grid grid-cols-2 gap-1">
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Slot do rótulo" value={item.labelSlotName ?? ''} onChange={e => set('labelSlotName', e.target.value)} />
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Slot das palavras" value={item.keywordsSlotName ?? ''} onChange={e => set('keywordsSlotName', e.target.value)} />
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Separador (ex: ; )" value={item.separator ?? '; '} onChange={e => set('separator', e.target.value)} />
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Terminador (ex: .)" value={item.terminator ?? '.'} onChange={e => set('terminator', e.target.value)} />
        </div>
      )}

      {item.type === 'PAIR_LIST' && (
        <div className="grid grid-cols-2 gap-1">
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Slot dos termos" value={item.termsSlotName ?? ''} onChange={e => set('termsSlotName', e.target.value)} />
          <input type="text" className="border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Slot das definições" value={item.definitionsSlotName ?? ''} onChange={e => set('definitionsSlotName', e.target.value)} />
          <input type="text" className="col-span-2 border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Separador (ex: — )" value={item.separator ?? ' — '} onChange={e => set('separator', e.target.value)} />
        </div>
      )}

      {item.type === 'REPEAT_GROUP' && (
        <div className="space-y-1">
          <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs"
            placeholder="Slot de entradas (ex: referencias)"
            value={item.entriesSlotName ?? ''} onChange={e => set('entriesSlotName', e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 text-blue-600 rounded"
              checked={item.pageBreakBetweenEntries ?? false}
              onChange={e => set('pageBreakBetweenEntries', e.target.checked)} />
            <span className="text-[10px] text-slate-600">Quebra de página entre entradas</span>
          </label>
        </div>
      )}
    </div>
  );
}

export function FlowTextualForm({ comp, onChange }: Props) {
  const items = comp.flowItems ?? [];

  function updateItem(idx: number, item: FlowItem) {
    const next = items.map((it, i) => i === idx ? item : it);
    onChange({ ...comp, flowItems: next });
  }
  function removeItem(idx: number) {
    onChange({ ...comp, flowItems: items.filter((_, i) => i !== idx) });
  }
  function addItem() {
    onChange({ ...comp, flowItems: [...items, defaultItem('PLAIN_TEXT')] });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((item, i) => (
          <ItemEditor key={i} item={item} idx={i}
            onUpdate={updated => updateItem(i, updated)}
            onRemove={() => removeItem(i)} />
        ))}
      </div>

      <button onClick={addItem}
        className="w-full border border-dashed border-slate-300 rounded-lg py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition">
        + Adicionar item
      </button>
    </div>
  );
}
