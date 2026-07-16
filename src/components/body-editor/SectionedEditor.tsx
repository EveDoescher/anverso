import React from 'react';
import BodyEditor from './BodyEditor';
import { Trash2, Plus, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

export default function SectionedEditor({ value, onChange }: any) {
  const items = value || [];

  const addItem = () => {
    onChange([...items, { title: 'Novo Item', sections: [] }]);
  };

  const removeItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    onChange(newItems);
  };

  return (
    <div className="bg-[var(--color-paper-soft)] p-5 md:p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
      {items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[var(--color-border-soft)] rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-success-bg)] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-success-soft)]">
            <Layers className="w-8 h-8 text-[var(--color-green)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-espresso)] mb-2">Itens Secionados</h3>
          <p className="text-[var(--color-neutral)] mb-8 max-w-sm text-center">Nenhum item adicionado ainda. Utilize itens secionados para Apêndices ou Anexos.</p>
          <Button variant="primary" icon={Plus} size="lg" onClick={addItem}>
            Adicionar Primeiro Item
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="border border-[var(--color-border-soft)] p-6 bg-white rounded-3xl shadow-sm relative group overflow-hidden">
                 <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--color-green)] opacity-80" />
                 
                 <div className="absolute top-5 right-5">
                   <IconButton 
                     variant="ghost"
                     icon={Trash2}
                     label="Remover Item"
                     onClick={() => removeItem(idx)} 
                     className="text-red-500 hover:text-red-600 hover:bg-red-50"
                   />
                 </div>
                 
                 <div className="flex items-center gap-4 mb-6 mt-2">
                   <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-success-bg)] text-[var(--color-green)] font-bold border border-[var(--color-success-soft)] shrink-0">
                     <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Item</span>
                     <span className="text-lg leading-none">{idx + 1}</span>
                   </div>
                   <div className="flex-1">
                     <label className="block text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-wider mb-1">Título do item</label>
                     <input
                       className="font-bold text-xl border-b-2 border-transparent hover:border-[var(--color-border-soft)] focus:border-[var(--color-green)] outline-none px-2 pb-1 w-full text-[var(--color-espresso)] bg-transparent transition-colors"
                       value={item.title}
                       onChange={e => {
                         const newItems = [...items];
                         newItems[idx].title = e.target.value;
                         onChange(newItems);
                       }}
                       placeholder="Ex: Apêndice A — Questionário aplicado"
                     />
                   </div>
                 </div>
                 <div className="rounded-2xl overflow-hidden border border-[var(--color-border-soft)] bg-white">
                   <BodyEditor 
                     value={item.sections} 
                     onChange={(sections: any) => {
                        const newItems = [...items];
                        newItems[idx].sections = sections;
                        onChange(newItems);
                     }}
                   />
                 </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
             <Button variant="secondary" icon={Layers} size="lg" onClick={addItem}>
               Adicionar Novo Item Secionado
             </Button>
          </div>
        </>
      )}
    </div>
  );
}
