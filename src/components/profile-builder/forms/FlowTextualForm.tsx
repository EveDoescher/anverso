'use client';

import { ComponentState, FlowItem, FlowItemType } from '@/lib/profileSerializer';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
}

const ITEM_TYPES: { value: FlowItemType; label: string; hint: string }[] = [
  {
    value: 'HEADING',
    label: 'Título Fixo',
    hint: 'Um título com texto predefinido — não editável pelo usuário no criador de trabalhos. Use para cabeçalhos de seção que são sempre iguais (ex: "RESUMO", "ABSTRACT").',
  },
  {
    value: 'BLANK_LINES',
    label: 'Linhas em Branco',
    hint: 'Insere um número fixo de linhas em branco para espaçamento vertical entre elementos.',
  },
  {
    value: 'PLAIN_TEXT',
    label: 'Parágrafo Simples',
    hint: 'Um bloco de texto livre preenchido pelo usuário no criador de trabalhos (ex: texto do resumo, declaração do autor). Referencia um slot pelo nome.',
  },
  {
    value: 'TABLE_BLOCK',
    label: 'Tabela',
    hint: 'Uma tabela com colunas definidas aqui e linhas preenchidas pelo usuário. Ideal para ficha catalográfica ou tabelas estruturadas.',
  },
  {
    value: 'BOLD_LABELED_KEYWORDS',
    label: 'Palavras-chave',
    hint: 'Exibe um rótulo em negrito seguido de uma lista de termos separados. Ideal para "Palavras-chave: termo1; termo2".',
  },
  {
    value: 'PAIR_LIST',
    label: 'Lista de Pares',
    hint: 'Cada entrada é um par termo-definição separado por um conector. Ideal para glossários ou listas de abreviaturas.',
  },
  {
    value: 'REPEAT_GROUP',
    label: 'Grupo de Repetição',
    hint: 'Um grupo de itens repetido para cada entrada do slot. Ideal para listas de autores ou qualquer estrutura com múltiplas ocorrências iguais.',
  },
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

  const typeInfo = ITEM_TYPES.find(t => t.value === item.type);

  return (
    <div className="border border-[var(--color-border-soft)] rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center gap-2">
        <select
          className="flex-1 border border-[var(--color-border-soft)] rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={item.type}
          onChange={e => onUpdate(defaultItem(e.target.value as FlowItemType))}
        >
          {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-sm font-bold px-1">×</button>
      </div>

      {typeInfo && (
        <p className="text-[10px] text-[var(--color-neutral)]/70 leading-snug">{typeInfo.hint}</p>
      )}

      {item.type === 'HEADING' && (
        <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
          placeholder="Texto fixo do título"
          value={item.text ?? ''} onChange={e => set('text', e.target.value)} />
      )}

      {item.type === 'BLANK_LINES' && (
        <div>
          <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Quantidade de linhas</label>
          <input type="number" min="1" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            value={item.count ?? 1} onChange={e => set('count', parseInt(e.target.value))} />
        </div>
      )}

      {item.type === 'PLAIN_TEXT' && (
        <div>
          <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Nome do slot</label>
          <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: texto, conteudo, resumo"
            value={item.slotName ?? ''} onChange={e => set('slotName', e.target.value)} />
          <p className="text-[10px] text-[var(--color-neutral)]/60 mt-0.5">Nome interno que identifica o slot de texto do usuário</p>
        </div>
      )}

      {item.type === 'TABLE_BLOCK' && (
        <div className="space-y-1.5">
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Cabeçalhos das colunas (separados por vírgula)</label>
            <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Autor, Ano, Título"
              value={(item.headers ?? []).join(', ')}
              onChange={e => set('headers', e.target.value.split(',').map(s => s.trim()))} />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Nome do slot de linhas</label>
            <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: linhas, itens"
              value={item.rowsSlotName ?? ''} onChange={e => set('rowsSlotName', e.target.value)} />
          </div>
        </div>
      )}

      {item.type === 'BOLD_LABELED_KEYWORDS' && (
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Slot do rótulo</label>
            <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
              placeholder="Ex: rotulo" value={item.labelSlotName ?? ''} onChange={e => set('labelSlotName', e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Slot das palavras</label>
            <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
              placeholder="Ex: palavras" value={item.keywordsSlotName ?? ''} onChange={e => set('keywordsSlotName', e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Separador entre termos</label>
            <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
              placeholder="Ex: ; " value={item.separator ?? '; '} onChange={e => set('separator', e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Terminador final</label>
            <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
              placeholder="Ex: ." value={item.terminator ?? '.'} onChange={e => set('terminator', e.target.value)} />
          </div>
        </div>
      )}

      {item.type === 'PAIR_LIST' && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Slot dos termos</label>
              <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
                placeholder="Ex: termos" value={item.termsSlotName ?? ''} onChange={e => set('termsSlotName', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Slot das definições</label>
              <input type="text" className="border border-[var(--color-border-soft)] rounded p-1.5 text-xs w-full"
                placeholder="Ex: definicoes" value={item.definitionsSlotName ?? ''} onChange={e => set('definitionsSlotName', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Separador entre termo e definição</label>
            <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs"
              placeholder="Ex: — " value={item.separator ?? ' — '} onChange={e => set('separator', e.target.value)} />
          </div>
        </div>
      )}

      {item.type === 'REPEAT_GROUP' && (
        <div className="space-y-1.5">
          <div>
            <label className="block text-[10px] text-[var(--color-neutral)] mb-0.5">Slot de entradas</label>
            <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs"
              placeholder="Ex: entradas, autores"
              value={item.entriesSlotName ?? ''} onChange={e => set('entriesSlotName', e.target.value)} />
            <p className="text-[10px] text-[var(--color-neutral)]/60 mt-0.5">O slot deve conter uma lista — cada entrada dispara um grupo</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 text-[var(--color-green)] rounded"
              checked={item.pageBreakBetweenEntries ?? false}
              onChange={e => set('pageBreakBetweenEntries', e.target.checked)} />
            <span className="text-[10px] text-[var(--color-neutral)]">Quebra de página entre entradas</span>
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
      <p className="text-[11px] text-[var(--color-neutral)]/70 leading-relaxed">
        Monte a sequência de elementos que compõem este componente. A ordem aqui determina a ordem no documento gerado.
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <ItemEditor key={i} item={item} idx={i}
            onUpdate={updated => updateItem(i, updated)}
            onRemove={() => removeItem(i)} />
        ))}
      </div>

      <button onClick={addItem}
        className="w-full border border-dashed border-[var(--color-border-soft)] rounded-lg py-2 text-xs text-[var(--color-neutral)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition">
        + Adicionar item
      </button>
    </div>
  );
}
