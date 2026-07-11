'use client';

import { ComponentState, BibRefType, BibEntryPart } from '@/lib/profileSerializer';
import * as Accordion from '@radix-ui/react-accordion';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
}

const REF_TYPES: { value: BibRefType; label: string }[] = [
  { value: 'BOOK', label: 'Livro' },
  { value: 'BOOK_CHAPTER', label: 'Capítulo de Livro' },
  { value: 'JOURNAL', label: 'Artigo de Periódico' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'LEGISLATION', label: 'Legislação' },
  { value: 'THESIS', label: 'Tese/Dissertação' },
  { value: 'CONFERENCE_PAPER', label: 'Artigo de Conferência' },
  { value: 'REPORT', label: 'Relatório Técnico' },
  { value: 'STANDARD', label: 'Norma Técnica' },
];

const DEFAULT_SOURCES = ['authors', 'title', 'subtitle', 'edition', 'city', 'publisher', 'year', 'pages', 'volume', 'issue', 'doi', 'url', 'accessDate', 'bookTitle', 'bookAuthors', 'journal', 'institution'];

function small(label: string, children: React.ReactNode) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}

function EntryFormatEditor({ parts, onChange }: { parts: BibEntryPart[]; onChange: (p: BibEntryPart[]) => void }) {
  function update(idx: number, key: keyof BibEntryPart, value: unknown) {
    const next = parts.map((p, i) => i === idx ? { ...p, [key]: value } : p);
    onChange(next);
  }
  function add() {
    onChange([...parts, { source: 'title', bold: false, prefix: '', suffix: '', optional: false }]);
  }
  function remove(idx: number) {
    onChange(parts.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-1">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center gap-1 text-[10px]">
          <select
            className="border border-slate-200 rounded px-1 py-0.5 text-[10px] bg-white"
            value={p.source}
            onChange={e => update(i, 'source', e.target.value)}
          >
            {DEFAULT_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value={`literal:${p.source.startsWith('literal:') ? p.source.slice(8) : ''}`}>literal...</option>
          </select>
          <input
            className="w-14 border border-slate-200 rounded px-1 py-0.5"
            placeholder="prefix"
            value={p.prefix}
            onChange={e => update(i, 'prefix', e.target.value)}
          />
          <input
            className="w-14 border border-slate-200 rounded px-1 py-0.5"
            placeholder="suffix"
            value={p.suffix}
            onChange={e => update(i, 'suffix', e.target.value)}
          />
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input type="checkbox" className="w-3 h-3" checked={p.bold} onChange={e => update(i, 'bold', e.target.checked)} />
            <span className="font-bold">B</span>
          </label>
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input type="checkbox" className="w-3 h-3" checked={p.optional} onChange={e => update(i, 'optional', e.target.checked)} />
            <span>opt</span>
          </label>
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      ))}
      <button onClick={add} className="text-blue-600 text-[10px] hover:underline">+ parte</button>
    </div>
  );
}

export function BibliographyForm({ comp, onChange }: Props) {
  const af = comp.authorFormat ?? {
    surnameUppercase: true,
    surnameGivenSeparator: ', ',
    nameTerminator: '.',
    multiAuthorJoiner: '; ',
    etAlLabel: 'et al.',
    etAlThreshold: 3,
  };
  const entryFormats = comp.entryFormats ?? {};

  function setAf<K extends keyof typeof af>(key: K, value: typeof af[K]) {
    onChange({ ...comp, authorFormat: { ...af, [key]: value } });
  }
  function setEntryFormat(type: BibRefType, parts: BibEntryPart[]) {
    onChange({ ...comp, entryFormats: { ...entryFormats, [type]: parts } });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Título da página</label>
        <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
          value={comp.headingText ?? 'REFERÊNCIAS'}
          onChange={e => onChange({ ...comp, headingText: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {small('Linhas em branco após título',
          <input type="number" min="0" className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            value={comp.blankLinesAfterHeading ?? 2}
            onChange={e => onChange({ ...comp, blankLinesAfterHeading: parseInt(e.target.value) })} />
        )}
        {small('Linhas em branco entre entradas',
          <input type="number" min="0" className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
            value={comp.blankLinesBetweenEntries ?? 1}
            onChange={e => onChange({ ...comp, blankLinesBetweenEntries: parseInt(e.target.value) })} />
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Ordenação</label>
        <select className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          value={comp.sortOrder ?? 'ALPHABETICAL'}
          onChange={e => onChange({ ...comp, sortOrder: e.target.value as 'ALPHABETICAL' | 'NONE' })}>
          <option value="ALPHABETICAL">Alfabética</option>
          <option value="NONE">Sem ordenação (ordem de inserção)</option>
        </select>
      </div>

      <Accordion.Root type="single" collapsible className="border border-slate-200 rounded-lg overflow-hidden">
        <Accordion.Item value="authors">
          <Accordion.Trigger className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition">
            Formato de Autores
            <span className="text-slate-400">▾</span>
          </Accordion.Trigger>
          <Accordion.Content className="p-3 space-y-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              {small('Separador Sobrenome, Nome',
                <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs"
                  value={af.surnameGivenSeparator} onChange={e => setAf('surnameGivenSeparator', e.target.value)} />
              )}
              {small('Terminador de nome',
                <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs"
                  value={af.nameTerminator} onChange={e => setAf('nameTerminator', e.target.value)} />
              )}
              {small('Junção multi-autor',
                <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs"
                  value={af.multiAuthorJoiner} onChange={e => setAf('multiAuthorJoiner', e.target.value)} />
              )}
              {small('Rótulo et al.',
                <input type="text" className="w-full border border-slate-200 rounded p-1.5 text-xs"
                  value={af.etAlLabel} onChange={e => setAf('etAlLabel', e.target.value)} />
              )}
              {small('Limite et al. (nº autores)',
                <input type="number" min="1" className="w-full border border-slate-200 rounded p-1.5 text-xs"
                  value={af.etAlThreshold} onChange={e => setAf('etAlThreshold', parseInt(e.target.value))} />
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300"
                checked={af.surnameUppercase} onChange={e => setAf('surnameUppercase', e.target.checked)} />
              <span className="text-xs font-medium text-slate-700">Sobrenome em maiúsculas</span>
            </label>
          </Accordion.Content>
        </Accordion.Item>

        {REF_TYPES.map(rt => (
          <Accordion.Item key={rt.value} value={rt.value}>
            <Accordion.Trigger className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition border-t border-slate-100">
              {rt.label}
              {entryFormats[rt.value]?.length
                ? <span className="text-green-500 text-[10px]">✓ {entryFormats[rt.value]!.length} partes</span>
                : <span className="text-orange-400 text-[10px]">não configurado ⚠</span>
              }
            </Accordion.Trigger>
            <Accordion.Content className="p-3 border-t border-slate-100">
              <EntryFormatEditor
                parts={entryFormats[rt.value] ?? []}
                onChange={parts => setEntryFormat(rt.value, parts)}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
