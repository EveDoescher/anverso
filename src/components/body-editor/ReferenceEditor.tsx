import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

type RefType = 'BOOK' | 'JOURNAL' | 'WEBSITE' | 'THESIS' | 'BOOK_CHAPTER' | 'CONFERENCE_PAPER' | 'LEGISLATION' | 'OTHER';

const REF_TYPE_LABELS: Record<RefType, string> = {
  BOOK: 'Livro',
  BOOK_CHAPTER: 'Capítulo de Livro',
  JOURNAL: 'Artigo em Periódico',
  WEBSITE: 'Site / Página Web',
  THESIS: 'Dissertação / Tese',
  CONFERENCE_PAPER: 'Trabalho em Evento',
  LEGISLATION: 'Legislação / Norma',
  OTHER: 'Outro',
};

interface RefEntry {
  id: string;
  type: RefType;
  // common
  authors?: string;
  year?: string;
  title?: string;
  // BOOK
  edition?: string;
  publisher?: string;
  publisherCity?: string;
  pages?: string;
  // BOOK_CHAPTER
  bookTitle?: string;
  bookAuthors?: string;
  chapterPages?: string;
  // JOURNAL
  journal?: string;
  volume?: string;
  issue?: string;
  articlePages?: string;
  doi?: string;
  // WEBSITE
  url?: string;
  accessDate?: string;
  siteName?: string;
  // THESIS
  institution?: string;
  degree?: string;
  // CONFERENCE_PAPER
  eventName?: string;
  eventCity?: string;
  proceedings?: string;
  // LEGISLATION
  lawNumber?: string;
  publishedIn?: string;
  publishedDate?: string;
  // OTHER
  freeText?: string;
}

function newEntry(): RefEntry {
  return { id: crypto.randomUUID(), type: 'BOOK' };
}

function EntryForm({ entry, onChange }: { entry: RefEntry; onChange: (e: RefEntry) => void }) {
  const set = (field: keyof RefEntry, value: string) => onChange({ ...entry, [field]: value });

  const fieldCls = 'w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] focus:ring-1 focus:ring-[var(--color-green)] p-2 rounded-lg text-sm text-[var(--color-espresso)] outline-none transition-shadow';
  const labelCls = 'block text-xs font-semibold text-[var(--color-neutral)] mb-1';

  const commonFields = (
    <>
      <div>
        <label className={labelCls}>Autores</label>
        <input className={fieldCls} value={entry.authors || ''} placeholder="Sobrenome, Nome; Sobrenome, Nome" onChange={e => set('authors', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Título</label>
        <input className={fieldCls} value={entry.title || ''} placeholder="Título completo da obra" onChange={e => set('title', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Ano</label>
        <input className={fieldCls} value={entry.year || ''} placeholder="Ex: 2024" onChange={e => set('year', e.target.value)} />
      </div>
    </>
  );

  if (entry.type === 'BOOK') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Edição</label>
          <input className={fieldCls} value={entry.edition || ''} placeholder="Ex: 3. ed." onChange={e => set('edition', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Editora</label>
          <input className={fieldCls} value={entry.publisher || ''} placeholder="Nome da editora" onChange={e => set('publisher', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Cidade</label>
          <input className={fieldCls} value={entry.publisherCity || ''} placeholder="Ex: São Paulo" onChange={e => set('publisherCity', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Total de páginas</label>
          <input className={fieldCls} value={entry.pages || ''} placeholder="Ex: 320 p." onChange={e => set('pages', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'BOOK_CHAPTER') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Título do livro</label>
          <input className={fieldCls} value={entry.bookTitle || ''} placeholder="Título da obra que contém o capítulo" onChange={e => set('bookTitle', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Organizadores do livro</label>
          <input className={fieldCls} value={entry.bookAuthors || ''} placeholder="Sobrenome, N. (org.)" onChange={e => set('bookAuthors', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Editora</label>
          <input className={fieldCls} value={entry.publisher || ''} onChange={e => set('publisher', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Cidade</label>
          <input className={fieldCls} value={entry.publisherCity || ''} onChange={e => set('publisherCity', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Páginas do capítulo</label>
          <input className={fieldCls} value={entry.chapterPages || ''} placeholder="Ex: p. 45–72" onChange={e => set('chapterPages', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'JOURNAL') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Nome do periódico</label>
          <input className={fieldCls} value={entry.journal || ''} placeholder="Ex: Revista Brasileira de Ciência" onChange={e => set('journal', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Volume</label>
          <input className={fieldCls} value={entry.volume || ''} placeholder="Ex: 12" onChange={e => set('volume', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Número / fascículo</label>
          <input className={fieldCls} value={entry.issue || ''} placeholder="Ex: 3" onChange={e => set('issue', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Páginas</label>
          <input className={fieldCls} value={entry.articlePages || ''} placeholder="Ex: p. 100–115" onChange={e => set('articlePages', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>DOI / URL</label>
          <input className={fieldCls} value={entry.doi || ''} placeholder="https://doi.org/..." onChange={e => set('doi', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'WEBSITE') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Nome do site</label>
          <input className={fieldCls} value={entry.siteName || ''} placeholder="Ex: Portal do Governo Federal" onChange={e => set('siteName', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>URL</label>
          <input className={fieldCls} value={entry.url || ''} placeholder="https://..." onChange={e => set('url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Data de acesso</label>
          <input className={fieldCls} value={entry.accessDate || ''} placeholder="Ex: 12 jan. 2025" onChange={e => set('accessDate', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'THESIS') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Grau (Mestrado / Doutorado)</label>
          <input className={fieldCls} value={entry.degree || ''} placeholder="Ex: Dissertação (Mestrado em Engenharia)" onChange={e => set('degree', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Instituição</label>
          <input className={fieldCls} value={entry.institution || ''} placeholder="Nome da universidade" onChange={e => set('institution', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Cidade</label>
          <input className={fieldCls} value={entry.publisherCity || ''} onChange={e => set('publisherCity', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Páginas</label>
          <input className={fieldCls} value={entry.pages || ''} placeholder="Ex: 142 f." onChange={e => set('pages', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'CONFERENCE_PAPER') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commonFields}
        <div>
          <label className={labelCls}>Nome do evento</label>
          <input className={fieldCls} value={entry.eventName || ''} placeholder="Ex: Simpósio Brasileiro de Computação" onChange={e => set('eventName', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Anais / Proceedings</label>
          <input className={fieldCls} value={entry.proceedings || ''} placeholder="Ex: Anais... SBC" onChange={e => set('proceedings', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Cidade do evento</label>
          <input className={fieldCls} value={entry.eventCity || ''} onChange={e => set('eventCity', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Páginas</label>
          <input className={fieldCls} value={entry.chapterPages || ''} placeholder="Ex: p. 10–18" onChange={e => set('chapterPages', e.target.value)} />
        </div>
      </div>
    );
  }

  if (entry.type === 'LEGISLATION') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelCls}>Identificação da norma</label>
          <input className={fieldCls} value={entry.lawNumber || ''} placeholder="Ex: BRASIL. Lei nº 9.610, de 19 de fevereiro de 1998." onChange={e => set('lawNumber', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Publicado em (veículo)</label>
          <input className={fieldCls} value={entry.publishedIn || ''} placeholder="Ex: Diário Oficial da União" onChange={e => set('publishedIn', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Data de publicação</label>
          <input className={fieldCls} value={entry.publishedDate || ''} placeholder="Ex: Brasília, DF, 20 fev. 1998" onChange={e => set('publishedDate', e.target.value)} />
        </div>
      </div>
    );
  }

  // OTHER
  return (
    <div>
      <label className={labelCls}>Referência completa (texto livre)</label>
      <textarea
        className="w-full border border-[var(--color-border-soft)] focus:border-[var(--color-green)] p-3 rounded-lg text-sm text-[var(--color-espresso)] outline-none resize-y min-h-[80px]"
        value={entry.freeText || ''}
        placeholder="Cole aqui a referência já formatada, ou preencha livremente."
        onChange={e => set('freeText', e.target.value)}
      />
    </div>
  );
}

export default function ReferenceEditor({ value, onChange }: { value: RefEntry[]; onChange: (v: RefEntry[]) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const items: RefEntry[] = Array.isArray(value) ? value : [];

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addEntry = () => {
    const entry = newEntry();
    onChange([...items, entry]);
    setExpanded(prev => new Set([...prev, entry.id]));
  };

  const removeEntry = (id: string) => {
    onChange(items.filter(e => e.id !== id));
  };

  const updateEntry = (updated: RefEntry) => {
    onChange(items.map(e => e.id === updated.id ? updated : e));
  };

  const summary = (entry: RefEntry): string => {
    const parts = [entry.authors, entry.title, entry.year].filter(Boolean);
    return parts.length > 0 ? parts.join('. ') + '.' : 'Nova referência';
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--color-border-soft)] rounded-2xl bg-[var(--color-paper-soft)] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-success-bg)] flex items-center justify-center mb-4 border border-[var(--color-success-soft)]">
            <BookOpen className="w-7 h-7 text-[var(--color-green)]" />
          </div>
          <h3 className="text-[var(--color-espresso)] font-semibold mb-1">Nenhuma referência adicionada</h3>
          <p className="text-[var(--color-neutral)] text-sm mb-5 max-w-xs text-center">Adicione cada fonte bibliográfica separadamente para uma formatação correta.</p>
          <Button variant="primary" icon={Plus} onClick={addEntry}>Adicionar Primeira Referência</Button>
        </div>
      ) : (
        <>
          {items.map((entry, idx) => (
            <div key={entry.id} className="bg-white border border-[var(--color-border-soft)] rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-green)] border border-[var(--color-success-soft)] shrink-0">
                  {REF_TYPE_LABELS[entry.type]}
                </span>
                <button
                  type="button"
                  className="flex-1 text-left text-sm font-medium text-[var(--color-espresso)] truncate hover:text-[var(--color-green)] transition-colors"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {idx + 1}. {summary(entry)}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.id)}
                    className="text-[var(--color-neutral)]/70 hover:text-[var(--color-espresso)] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-paper-soft)] transition-colors"
                    aria-label={expanded.has(entry.id) ? 'Recolher' : 'Expandir'}
                  >
                    {expanded.has(entry.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <IconButton variant="ghost" icon={Trash2} label="Remover" onClick={() => removeEntry(entry.id)} className="text-red-500 hover:bg-red-50" />
                </div>
              </div>

              {expanded.has(entry.id) && (
                <div className="border-t border-[var(--color-border-soft)] p-4 bg-[var(--color-paper)]/40">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Tipo de referência</label>
                    <select
                      className="border border-[var(--color-border-soft)] focus:border-[var(--color-green)] p-2 rounded-lg text-sm text-[var(--color-espresso)] outline-none bg-white"
                      value={entry.type}
                      onChange={e => updateEntry({ ...entry, type: e.target.value as RefType })}
                    >
                      {(Object.keys(REF_TYPE_LABELS) as RefType[]).map(t => (
                        <option key={t} value={t}>{REF_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <EntryForm entry={entry} onChange={updateEntry} />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <Button variant="secondary" icon={Plus} onClick={addEntry}>
              Adicionar Referência
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
